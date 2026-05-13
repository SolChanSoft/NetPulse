package com.netpulse.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.util.HtmlUtils;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${netpulse.mail.from}")
    private String fromEmail;

    // ─────────────────────────────────────────
    // PDF 첨부 이메일 발송
    // ─────────────────────────────────────────
    public boolean sendReportEmail(
            String toEmail,
            String companyName,
            int year,
            int month,
            byte[] pdfData) {
        try {
            MimeMessage message =
                    mailSender.createMimeMessage();
            MimeMessageHelper helper =
                    new MimeMessageHelper(
                            message, true, "UTF-8");

            // 이메일 설정
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(
                    String.format(
                            "[NetPulse] %s %d년 %d월 모니터링 리포트",
                            companyName, year, month));

            // 이메일 본문
            String body = String.format("""
                <html>
                <body style="font-family: Arial,
                    sans-serif; margin: 40px;">
                    <div style="background: #1565c0;
                        color: white; padding: 20px;
                        border-radius: 8px;
                        margin-bottom: 20px;">
                        <h2 style="margin:0">
                            🌐 NetPulse 월간 리포트
                        </h2>
                        <p style="margin:5px 0 0">
                            %d년 %d월
                        </p>
                    </div>

                    <p>안녕하세요, <b>%s</b> 담당자님!</p>
                    <p>%d년 %d월 네트워크 모니터링 리포트를 첨부해 드립니다.</p>

                    <div style="background: #e3f2fd;
                        padding: 15px;
                        border-radius: 8px;
                        margin: 20px 0;">
                        <p style="margin:0">
                            📎 첨부파일을 확인해 주세요!
                        </p>
                    </div>

                    <p>문의사항은 NetPulse 관리자에게 연락해 주세요.</p>

                    <hr>
                    <p style="color:#666; font-size:12px">
                        본 메일은 NetPulse 시스템에서 자동 발송되었습니다.
                    </p>
                </body>
                </html>
                """,
                    year, month,
                    companyName,
                    year, month);

            helper.setText(body, true);

            // PDF 첨부
            helper.addAttachment(
                    String.format(
                            "NetPulse_%d년%d월_리포트.pdf",
                            year, month),
                    new org.springframework.core
                            .io.ByteArrayResource(pdfData));

            mailSender.send(message);
            log.info("이메일 발송 성공: {} → {}",
                    companyName, toEmail);
            return true;

        } catch (MessagingException | MailException e) {
            log.error("이메일 발송 실패: {} → {} - {}",
                    companyName, toEmail,
                    e.getMessage());
            return false;
        }
    }

    // ─────────────────────────────────────────
    // 장애 알림 이메일 발송
    // ─────────────────────────────────────────
    public boolean sendIncidentEmail(
            String toEmail,
            String companyName,
            String deviceName,
            String ipAddress,
            String description) {
        try {
            String safeCompanyName =
                    HtmlUtils.htmlEscape(companyName);
            String safeDeviceName =
                    HtmlUtils.htmlEscape(deviceName);
            String safeIpAddress =
                    HtmlUtils.htmlEscape(ipAddress);
            String safeDescription =
                    HtmlUtils.htmlEscape(description);

            MimeMessage message =
                    mailSender.createMimeMessage();
            MimeMessageHelper helper =
                    new MimeMessageHelper(
                            message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(
                    String.format(
                            "[NetPulse 장애알림] %s - %s",
                            safeCompanyName, safeDeviceName));

            String body = String.format("""
                <html>
                <body style="font-family: Arial,
                    sans-serif; margin: 40px;">
                    <div style="background: #d32f2f;
                        color: white; padding: 20px;
                        border-radius: 8px;
                        margin-bottom: 20px;">
                        <h2 style="margin:0">
                            🚨 장애 발생 알림
                        </h2>
                    </div>

                    <table style="width:100%%;
                        border-collapse:collapse;">
                        <tr>
                            <td style="padding:10px;
                                background:#f5f5f5;
                                font-weight:bold;
                                width:150px;
                                border:1px solid #ddd">
                                고객사
                            </td>
                            <td style="padding:10px;
                                border:1px solid #ddd">
                                %s
                            </td>
                        </tr>
                        <tr>
                            <td style="padding:10px;
                                background:#f5f5f5;
                                font-weight:bold;
                                border:1px solid #ddd">
                                장비명
                            </td>
                            <td style="padding:10px;
                                border:1px solid #ddd">
                                %s
                            </td>
                        </tr>
                        <tr>
                            <td style="padding:10px;
                                background:#f5f5f5;
                                font-weight:bold;
                                border:1px solid #ddd">
                                IP주소
                            </td>
                            <td style="padding:10px;
                                border:1px solid #ddd">
                                %s
                            </td>
                        </tr>
                        <tr>
                            <td style="padding:10px;
                                background:#f5f5f5;
                                font-weight:bold;
                                border:1px solid #ddd">
                                장애내용
                            </td>
                            <td style="padding:10px;
                                border:1px solid #ddd;
                                color:#d32f2f">
                                %s
                            </td>
                        </tr>
                    </table>

                    <p style="margin-top:20px">
                        즉시 확인이 필요합니다!
                    </p>

                    <hr>
                    <p style="color:#666;
                        font-size:12px">
                        본 메일은 NetPulse 시스템에서 자동 발송되었습니다.
                    </p>
                </body>
                </html>
                """,
                    safeCompanyName, safeDeviceName,
                    safeIpAddress, safeDescription);

            helper.setText(body, true);
            mailSender.send(message);

            log.info("장애 알림 이메일 발송 성공: {}",
                    companyName);
            return true;

        } catch (MessagingException | MailException e) {
            log.error("장애 알림 이메일 발송 실패: {}",
                    e.getMessage());
            return false;
        }
    }
}