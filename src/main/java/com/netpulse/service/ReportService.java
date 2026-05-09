package com.netpulse.service;

// ReportService.java 상단 import 추가
import com.itextpdf.html2pdf.ConverterProperties;
import com.itextpdf.layout.font.FontProvider;
import com.itextpdf.html2pdf.HtmlConverter;
import com.netpulse.entity.Customer;
import com.netpulse.entity.Device;
import com.netpulse.entity.IncidentLog;
import com.netpulse.entity.MaintenanceLog;
import com.netpulse.repository.CustomerRepository;
import com.netpulse.repository.DeviceRepository;
import com.netpulse.repository.IncidentLogRepository;
import com.netpulse.repository.MaintenanceLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReportService {

    private final CustomerRepository customerRepository;
    private final DeviceRepository deviceRepository;
    private final IncidentLogRepository incidentLogRepository;
    private final MaintenanceLogRepository maintenanceLogRepository;

    // ─────────────────────────────────────────
    // 고객사별 월간 리포트 PDF 생성
    // ─────────────────────────────────────────
    public byte[] generateMonthlyReport(
            Long customerId,
            int year,
            int month) {
        try {
            // 데이터 조회
            Customer customer = customerRepository
                    .findById(customerId)
                    .orElseThrow(() ->
                            new RuntimeException("고객사 없음"));

            List<Device> devices = deviceRepository
                    .findByCustomerId(customerId);

            LocalDateTime startOfMonth =
                    LocalDate.of(year, month, 1)
                            .atStartOfDay();
            LocalDateTime endOfMonth =
                    LocalDate.of(year, month, 1)
                            .plusMonths(1)
                            .atStartOfDay();

            List<IncidentLog> incidents =
                    incidentLogRepository
                            .findByDeviceCustomerId(customerId)
                            .stream()
                            .filter(i -> i.getOccurredAt() != null
                                    && i.getOccurredAt()
                                    .isAfter(startOfMonth)
                                    && i.getOccurredAt()
                                    .isBefore(endOfMonth))
                            .collect(Collectors.toList());

            List<MaintenanceLog> maintenances =
                    maintenanceLogRepository
                            .findByDeviceCustomerId(customerId)
                            .stream()
                            .filter(m -> m.getWorkDate() != null
                                    && !m.getWorkDate()
                                    .isBefore(LocalDate.of(
                                            year, month, 1))
                                    && m.getWorkDate()
                                    .isBefore(LocalDate.of(
                                                    year, month, 1)
                                            .plusMonths(1)))
                            .collect(Collectors.toList());

            // HTML 생성
            String html = generateHtml(
                    customer, devices,
                    incidents, maintenances,
                    year, month);

            // ─────────────────────────────────────
            // 한글 폰트 설정 ← 여기 추가!
            // ─────────────────────────────────────
            com.itextpdf.html2pdf.ConverterProperties
                    properties =
                    new com.itextpdf.html2pdf
                            .ConverterProperties();

            com.itextpdf.layout.font.FontProvider
                    fontProvider =
                    new com.itextpdf.layout.font
                            .FontProvider();

            // 기본 폰트 추가
            fontProvider.addStandardPdfFonts();
            fontProvider.addSystemFonts();

            // 나눔고딕 폰트 추가 ← 여기!
            fontProvider.addFont(
                    "src/main/resources/fonts/NanumGothic.ttf");

            properties.setFontProvider(fontProvider);
            // ─────────────────────────────────────

            // PDF 변환
            ByteArrayOutputStream outputStream =
                    new ByteArrayOutputStream();

            // properties 적용해서 변환 ← 수정!
            HtmlConverter.convertToPdf(
                    html, outputStream, properties);

            log.info("리포트 생성 완료: {} - {}년 {}월",
                    customer.getCompanyName(), year, month);

            return outputStream.toByteArray();

        } catch (Exception e) {
            log.error("리포트 생성 오류: {}",
                    e.getMessage());
            throw new RuntimeException(
                    "리포트 생성 실패", e);
        }
    }

    // ─────────────────────────────────────────
    // HTML 리포트 템플릿 생성
    // ─────────────────────────────────────────
    private String generateHtml(
            Customer customer,
            List<Device> devices,
            List<IncidentLog> incidents,
            List<MaintenanceLog> maintenances,
            int year, int month) {

        // 장비 현황 통계
        long normalCount = devices.stream()
                .filter(d -> d.getStatus() != null
                        && d.getStatus().name()
                        .equals("NORMAL"))
                .count();
        long errorCount = devices.stream()
                .filter(d -> d.getStatus() != null
                        && d.getStatus().name()
                        .equals("ERROR"))
                .count();

        // 장애 통계
        long resolvedCount = incidents.stream()
                .filter(i -> i.getStatus() != null
                        && i.getStatus().name()
                        .equals("RESOLVED"))
                .count();
        long openCount = incidents.stream()
                .filter(i -> i.getStatus() != null
                        && i.getStatus().name()
                        .equals("OPEN"))
                .count();

        // 장비 테이블 HTML
        StringBuilder deviceRows = new StringBuilder();
        for (Device device : devices) {
            String statusText =
                    device.getStatus() == null
                            ? "알수없음"
                            : switch (device.getStatus()) {
                        case NORMAL -> "정상";
                        case WARNING -> "경고";
                        case ERROR -> "장애";
                        default -> "알수없음";
                    };
            String statusColor =
                    device.getStatus() == null
                            ? "#666"
                            : switch (device.getStatus()) {
                        case NORMAL -> "#2e7d32";
                        case WARNING -> "#f57c00";
                        case ERROR -> "#d32f2f";
                        default -> "#666";
                    };

            deviceRows.append(String.format("""
                <tr>
                    <td>%s</td>
                    <td>%s</td>
                    <td>%s</td>
                    <td>%s</td>
                    <td style="color:%s;font-weight:bold">
                        %s
                    </td>
                </tr>
                """,
                    device.getDeviceName(),
                    device.getDeviceType() != null
                            ? device.getDeviceType().name()
                            : "-",
                    device.getIpAddress() != null
                            ? device.getIpAddress() : "-",
                    device.getLocation() != null
                            ? device.getLocation() : "-",
                    statusColor,
                    statusText
            ));
        }

        // 장애 테이블 HTML
        StringBuilder incidentRows =
                new StringBuilder();
        if (incidents.isEmpty()) {
            incidentRows.append("""
                <tr>
                    <td colspan="4"
                        style="text-align:center;
                        color:#2e7d32">
                        이번 달 장애 없음 ✅
                    </td>
                </tr>
                """);
        } else {
            DateTimeFormatter dtf =
                    DateTimeFormatter.ofPattern(
                            "yyyy-MM-dd HH:mm");
            for (IncidentLog incident : incidents) {
                String statusText =
                        incident.getStatus() == null
                                ? "-"
                                : switch (incident.getStatus()) {
                            case OPEN -> "미해결";
                            case INPROGRESS -> "처리중";
                            case RESOLVED -> "해결완료";
                            default -> "-";
                        };
                incidentRows.append(String.format("""
                    <tr>
                        <td>%s</td>
                        <td>%s</td>
                        <td>%s</td>
                        <td>%s</td>
                    </tr>
                    """,
                        incident.getDevice() != null
                                ? incident.getDevice()
                                  .getDeviceName() : "-",
                        incident.getDescription() != null
                                ? incident.getDescription() : "-",
                        incident.getOccurredAt() != null
                                ? incident.getOccurredAt()
                                  .format(dtf) : "-",
                        statusText
                ));
            }
        }

        // 유지보수 테이블 HTML
        StringBuilder maintenanceRows =
                new StringBuilder();
        if (maintenances.isEmpty()) {
            maintenanceRows.append("""
                <tr>
                    <td colspan="4"
                        style="text-align:center">
                        이번 달 유지보수 이력 없음
                    </td>
                </tr>
                """);
        } else {
            for (MaintenanceLog m : maintenances) {
                maintenanceRows.append(
                        String.format("""
                    <tr>
                        <td>%s</td>
                        <td>%s</td>
                        <td>%s</td>
                        <td>%s</td>
                    </tr>
                    """,
                                m.getDevice() != null
                                        ? m.getDevice().getDeviceName()
                                        : "-",
                                m.getWorkDate() != null
                                        ? m.getWorkDate().toString()
                                        : "-",
                                m.getWorker() != null
                                        ? m.getWorker() : "-",
                                m.getWorkContent() != null
                                        ? m.getWorkContent() : "-"
                        ));
            }
        }

        // 전체 HTML 템플릿
        return String.format("""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 40px;
                    color: #333;
                }
                .header {
                    background: #1565c0;
                    color: white;
                    padding: 20px;
                    margin-bottom: 30px;
                }
                .header h1 {
                    margin: 0;
                    font-size: 24px;
                }
                .header p {
                    margin: 5px 0 0;
                }
                .section {
                    margin-bottom: 30px;
                }
                .section h2 {
                    color: #1565c0;
                    border-bottom: 2px solid #1565c0;
                    padding-bottom: 8px;
                }
                .stats-table {
                    width: 100%%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                }
                .stats-table td {
                    text-align: center;
                    padding: 15px;
                    background: #f5f5f5;
                    border: 3px solid white;
                    width: 33%%;
                }
                .stats-table .value {
                    font-size: 30px;
                    font-weight: bold;
                    color: #1565c0;
                }
                .stats-table .label {
                    color: #666;
                    font-size: 14px;
                }
                table {
                    width: 100%%;
                    border-collapse: collapse;
                    margin-top: 10px;
                }
                th {
                    background: #e3f2fd;
                    padding: 10px;
                    text-align: left;
                    border: 1px solid #ddd;
                    font-weight: bold;
                    color: #000;
                }
                td {
                    padding: 8px 10px;
                    border: 1px solid #ddd;
                }
                tr:nth-child(even) {
                    background: #f9f9f9;
                }
                .footer {
                    margin-top: 40px;
                    text-align: center;
                    color: #666;
                    font-size: 12px;
                    border-top: 1px solid #ddd;
                    padding-top: 20px;
                }
                .info-table {
                    width: 100%%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                    background: #e3f2fd;
                }
                .info-table td {
                    padding: 10px;
                    border: 1px solid #c5cae9;
                }
                .info-table .label {
                    font-weight: bold;
                    width: 120px;
                    background: #bbdefb;
                }
            </style>
        </head>
        <body>
            <!-- 헤더 -->
            <div class="header">
                <h1>NetPulse 월간 모니터링 리포트</h1>
                <p>%d년 %d월 | 생성일시: %s</p>
            </div>

            <!-- 고객사 정보 -->
            <div class="section">
                <h2>고객사 정보</h2>
                <table class="info-table">
                    <tr>
                        <td class="label">회사명</td>
                        <td>%s</td>
                        <td class="label">담당자</td>
                        <td>%s</td>
                    </tr>
                    <tr>
                        <td class="label">연락처</td>
                        <td>%s</td>
                        <td class="label">계약만료일</td>
                        <td>%s</td>
                    </tr>
                </table>
            </div>

            <!-- 장비 현황 -->
            <div class="section">
                <h2>장비 현황</h2>
                <table class="stats-table">
                    <tr>
                        <td>
                            <div class="value">%d</div>
                            <div class="label">
                                전체 장비
                            </div>
                        </td>
                        <td>
                            <div class="value"
                                style="color:#2e7d32">
                                %d
                            </div>
                            <div class="label">
                                정상 장비
                            </div>
                        </td>
                        <td>
                            <div class="value"
                                style="color:#d32f2f">
                                %d
                            </div>
                            <div class="label">
                                장애 장비
                            </div>
                        </td>
                    </tr>
                </table>
                <table>
                    <thead>
                        <tr>
                            <th>장비명</th>
                            <th>유형</th>
                            <th>IP주소</th>
                            <th>위치</th>
                            <th>상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        %s
                    </tbody>
                </table>
            </div>

            <!-- 장애 이력 -->
            <div class="section">
                <h2>월간 장애 이력</h2>
                <table class="stats-table">
                    <tr>
                        <td>
                            <div class="value">%d</div>
                            <div class="label">
                                전체 장애
                            </div>
                        </td>
                        <td>
                            <div class="value"
                                style="color:#2e7d32">
                                %d
                            </div>
                            <div class="label">
                                해결 완료
                            </div>
                        </td>
                        <td>
                            <div class="value"
                                style="color:#d32f2f">
                                %d
                            </div>
                            <div class="label">
                                미해결
                            </div>
                        </td>
                    </tr>
                </table>
                <table>
                    <thead>
                        <tr>
                            <th>장비명</th>
                            <th>장애내용</th>
                            <th>발생시간</th>
                            <th>상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        %s
                    </tbody>
                </table>
            </div>

            <!-- 유지보수 이력 -->
            <div class="section">
                <h2>월간 유지보수 이력</h2>
                <table>
                    <thead>
                        <tr>
                            <th>장비명</th>
                            <th>작업일</th>
                            <th>작업자</th>
                            <th>작업내용</th>
                        </tr>
                    </thead>
                    <tbody>
                        %s
                    </tbody>
                </table>
            </div>

            <!-- 푸터 -->
            <div class="footer">
                <p>본 리포트는 NetPulse 시스템에서
                   자동 생성되었습니다.</p>
                <p>문의: NetPulse 관리자</p>
            </div>
        </body>
        </html>
        """,
                // 헤더
                year, month,
                LocalDateTime.now().format(
                        DateTimeFormatter.ofPattern(
                                "yyyy-MM-dd HH:mm")),
                // 고객사 정보
                customer.getCompanyName(),
                customer.getManagerName() != null
                        ? customer.getManagerName() : "-",
                customer.getPhone() != null
                        ? customer.getPhone() : "-",
                customer.getContractExpiry() != null
                        ? customer.getContractExpiry().toString()
                        : "-",
                // 장비 현황
                devices.size(),
                normalCount,
                errorCount,
                deviceRows.toString(),
                // 장애 이력
                incidents.size(),
                resolvedCount,
                openCount,
                incidentRows.toString(),
                // 유지보수 이력
                maintenanceRows.toString()
        );
    }
}