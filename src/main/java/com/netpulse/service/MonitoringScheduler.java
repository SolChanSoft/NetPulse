package com.netpulse.service;

import com.netpulse.entity.Device;
import com.netpulse.entity.Device.DeviceStatus;
import com.netpulse.entity.IncidentLog;
import com.netpulse.repository.CustomerRepository;
import com.netpulse.repository.IncidentLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;


@Slf4j
@Component
@RequiredArgsConstructor

public class MonitoringScheduler {

    private static final Duration KAKAO_ALERT_INTERVAL =
            Duration.ofHours(1);

    private final DeviceService deviceService;
    private final SnmpService snmpService;
    private final KakaoService kakaoService;
    private final PingService pingService;
    private final OnvifService onvifService;
    private final ReportService reportService;
    private final CustomerRepository customerRepository;
    private final EmailService emailService;
    private final IncidentLogRepository incidentLogRepository;

    @Value("${kakao.token.access-token:}")
    private String kakaoAccessToken;


// ─────────────────────────────────────────
// 5분마다 전체 장비 모니터링
    // ─────────────────────────────────────────
    @Scheduled(fixedDelay = 300000)
    public void monitorAllDevices() {
        log.info("=== 자동 모니터링 시작 ===");

        List<Device> devices =
                deviceService.getAllDevices();

        if (devices.isEmpty()) {
            log.info("등록된 장비가 없습니다.");
            return;
        }

        log.info("모니터링 대상 장비: {}대",
                devices.size());

        for (Device device : devices) {
            try {
                // SNMP Community 있으면 SNMP 수집
                // 없으면 Ping 체크
                if (device.getSnmpCommunity() != null
                        && !device.getSnmpCommunity()
                        .isEmpty()) {
                    snmpService.collectDeviceStatus(
                            device);
                } else {
                    pingService.pingDevice(device);
                }

                Device refreshedDevice =
                        deviceService.getDevice(device.getId());

                // 장애 장비 알림 전송
                if (refreshedDevice.getStatus() ==
                        DeviceStatus.ERROR) {
                    sendAlertIfNeeded(refreshedDevice);
                }

            } catch (Exception e) {
                log.error("모니터링 오류 - 장비: {} - {}",
                        device.getDeviceName(),
                        e.getMessage());
                }
        }
        log.info("=== 자동 모니터링 완료 ===");
    }

    // ─────────────────────────────────────────
    // 매일 오전 9시 계약만료 임박 알림
    // ─────────────────────────────────────────
    @Scheduled(cron = "0 0 9 * * *")
    public void checkContractExpiry() {
        log.info("=== 계약만료 체크 시작 ===");

        // 30일 이내 만료 고객사 조회
        customerRepository.findAll()
                .forEach(customer -> {
                    // TODO: Customer 엔티티에 계약 만료일 필드가 있다면
                    // 30일 이내 만료 여부를 체크하고 알림 발송 처리
                    log.debug("계약만료 체크 대상 고객사: {}",
                            customer.getCompanyName());
                });

        log.info("계약만료 체크 완료");
    }

    // ─────────────────────────────────────────
    // 장애 알림 전송
    // ─────────────────────────────────────────
    private void sendAlertIfNeeded(Device device) {
        IncidentLog incidentLog = incidentLogRepository
                .findFirstByDeviceIdAndStatusOrderByOccurredAtDesc(
                        device.getId(),
                        IncidentLog.IncidentStatus.OPEN)
                .orElse(null);

        if (incidentLog == null) {
            log.debug("미해결 장애 이력 없음 - 카카오 알림 생략: {}",
                    device.getDeviceName());
            return;
        }

        if (!shouldSendKakaoAlert(incidentLog)) {
            log.info("카카오 장애 알림 중복 방지 - 생략: {}",
                    device.getDeviceName());
            return;
        }

        boolean result = kakaoService.sendIncidentAlert(
                device.getDeviceName(),
                device.getIpAddress(),
                incidentLog.getDescription());

        if (result) {
            incidentLog.setLastKakaoAlertAt(LocalDateTime.now());
            incidentLogRepository.save(incidentLog);

            log.info("장애 알림 전송 성공: {}",
                    device.getDeviceName());
        } else {
            log.warn("장애 알림 전송 실패: {}",
                    device.getDeviceName());
        }
    }

    private boolean shouldSendKakaoAlert(IncidentLog incidentLog) {
        LocalDateTime lastAlertAt =
                incidentLog.getLastKakaoAlertAt();

        if (lastAlertAt == null) {
            return true;
        }

        LocalDateTime nextAlertTime =
                lastAlertAt.plus(KAKAO_ALERT_INTERVAL);

        return LocalDateTime.now().isAfter(nextAlertTime);
    }

    public void updateKakaoToken(String token) {
        if (token == null || token.isBlank()) {
            log.warn("빈 카카오 토큰은 업데이트하지 않습니다.");
            return;
        }

        this.kakaoAccessToken = token;
        log.info("카카오 토큰 업데이트 완료");
    }

    // 기존 monitorAllDevices 메서드 아래에 추가
    @Scheduled(fixedDelay = 300000)
    public void monitorAllCameras() {
        log.info("=== 카메라 모니터링 시작 ===");
        onvifService.checkAllCameras();
        log.info("=== 카메라 모니터링 완료 ===");
    }

    // 매월 1일 오전 9시 자동 리포트 발송
    // 기존 sendMonthlyReports 메서드 수정
    @Scheduled(cron = "0 0 9 1 * *")
    public void sendMonthlyReports() {
        log.info("=== 월간 리포트 자동 발송 시작 ===");

        LocalDate lastMonth = LocalDate.now()
                .minusMonths(1);
        int year = lastMonth.getYear();
        int month = lastMonth.getMonthValue();

        customerRepository.findAll()
                .forEach(customer -> {
                    try {
                        // PDF 생성
                        byte[] pdf = reportService
                                .generateMonthlyReport(
                                        customer.getId(), year, month);

                            boolean emailSent = false;

                            if (customer.getEmail() != null
                                    && !customer.getEmail().isEmpty()) {
                                emailSent = emailService.sendReportEmail(
                                        customer.getEmail(),
                                        customer.getCompanyName(),
                                        year, month, pdf);
                            }

                            if (emailSent
                                    && kakaoAccessToken != null
                                    && !kakaoAccessToken.isEmpty()) {
                                String message =
                                        "[NetPulse 월간리포트]\n" +
                                                customer.getCompanyName() +
                                                "\n" + year + "년 " + month +
                                                "월 리포트가 이메일로 발송되었습니다!";
                                kakaoService.sendMessageToMe(
                                        kakaoAccessToken, message);
                            }

                            log.info("리포트 발송 완료: {}",
                                    customer.getCompanyName());

                    } catch (Exception e) {
                        log.error("리포트 발송 실패: {} - {}",
                                customer.getCompanyName(),
                                e.getMessage());
                    }
                });

        log.info("=== 월간 리포트 자동 발송 완료 ===");
    }
}