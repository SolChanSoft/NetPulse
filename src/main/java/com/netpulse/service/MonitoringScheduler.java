package com.netpulse.service;

import com.netpulse.entity.Device;
import com.netpulse.entity.Device.DeviceStatus;
import com.netpulse.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;


@Slf4j
@Component
@EnableScheduling
@RequiredArgsConstructor

public class MonitoringScheduler {

    private final DeviceService deviceService;
    private final SnmpService snmpService;
    private final KakaoService kakaoService;
    private final PingService pingService;
    private final OnvifService onvifService;
    private final ReportService reportService;
    private final CustomerRepository customerRepository;

    // 카카오 액세스 토큰 (임시)
    // 나중에 DB 저장으로 변경 예정
    private String kakaoAccessToken = "";


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

                // 장애 장비 알림 전송
                if (device.getStatus() ==
                        DeviceStatus.ERROR) {
                    sendAlertIfNeeded(device);
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
        List<Device> devices =
                deviceService.getAllDevices();

        log.info("계약만료 체크 완료");
    }

    // ─────────────────────────────────────────
    // 장애 알림 전송
    // ─────────────────────────────────────────
    private void sendAlertIfNeeded(Device device) {
        if (kakaoAccessToken == null ||
                kakaoAccessToken.isEmpty()) {
            log.warn("카카오 토큰 없음 - 알림 전송 불가");
            return;
        }

        boolean result = kakaoService.sendIncidentAlert(
                kakaoAccessToken,
                device.getDeviceName(),
                device.getIpAddress(),
                "장비 응답 없음"
        );

        if (result) {
            log.info("장애 알림 전송 성공: {}",
                    device.getDeviceName());
        } else {
            log.warn("장애 알림 전송 실패: {}",
                    device.getDeviceName());
        }
    }

    // ─────────────────────────────────────────
    // 카카오 토큰 업데이트 (API 로 호출)
    // ─────────────────────────────────────────
    public void updateKakaoToken(String token) {
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
    @Scheduled(cron = "0 0 9 1 * *")
    public void sendMonthlyReports() {
        log.info("=== 월간 리포트 자동 발송 시작 ===");

        // 지난달 년/월 계산
        LocalDate lastMonth = LocalDate.now()
                .minusMonths(1);
        int year = lastMonth.getYear();
        int month = lastMonth.getMonthValue();

        // 전체 고객사 리포트 생성
        customerRepository.findAll().forEach(customer -> {
            try {
                byte[] pdf = reportService
                        .generateMonthlyReport(
                                customer.getId(), year, month);

                // 카카오톡으로 알림 발송
                if (kakaoAccessToken != null
                        && !kakaoAccessToken.isEmpty()) {
                    String message =
                            "[NetPulse 월간리포트]\n" +
                                    customer.getCompanyName() +
                                    " 고객사\n" +
                                    year + "년 " + month +
                                    "월 리포트가 생성되었습니다.\n" +
                                    "관리자 포털에서 확인해 주세요!";

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