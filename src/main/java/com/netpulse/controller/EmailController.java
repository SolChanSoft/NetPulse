package com.netpulse.controller;

import com.netpulse.entity.Customer;
import com.netpulse.repository.CustomerRepository;
import com.netpulse.service.EmailService;
import com.netpulse.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Profile({"dev", "local"})
@RestController
@RequestMapping("/api/email")
@RequiredArgsConstructor
public class EmailController {

    private final EmailService emailService;
    private final ReportService reportService;
    private final CustomerRepository
            customerRepository;

    // 리포트 이메일 테스트 발송
    @PostMapping("/report/{customerId}")
    public ResponseEntity<Map<String, Object>>
    sendReport(
            @PathVariable Long customerId,
            @RequestParam(required = false)
            Integer year,
            @RequestParam(required = false)
            Integer month) {

        if (year == null)
            year = LocalDate.now().getYear();
        if (month == null)
            month = LocalDate.now().getMonthValue();

        Map<String, Object> response =
                new HashMap<>();

        try {
            Customer customer = customerRepository
                    .findById(customerId)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "고객사 없음"));

            if (customer.getEmail() == null
                    || customer.getEmail().isEmpty()) {
                response.put("success", false);
                response.put("message",
                        "고객사 이메일이 없습니다!");
                return ResponseEntity.ok(response);
            }

            byte[] pdf = reportService
                    .generateMonthlyReport(
                            customerId, year, month);

            boolean result = emailService
                    .sendReportEmail(
                            customer.getEmail(),
                            customer.getCompanyName(),
                            year, month, pdf);

            response.put("success", result);
            response.put("message", result
                    ? "이메일 발송 성공!"
                    : "이메일 발송 실패!");
            response.put("to",
                    customer.getEmail());

        } catch (Exception e) {
            response.put("success", false);
            response.put("message",
                    "오류: " + e.getMessage());
        }

        return ResponseEntity.ok(response);
    }

    // 장애 알림 이메일 테스트
    @PostMapping("/incident")
    public ResponseEntity<Map<String, Object>>
    sendIncident(
            @RequestParam String toEmail,
            @RequestParam String companyName,
            @RequestParam String deviceName,
            @RequestParam String ipAddress,
            @RequestParam String description) {

        boolean result = emailService
                .sendIncidentEmail(
                        toEmail, companyName,
                        deviceName, ipAddress,
                        description);

        Map<String, Object> response =
                new HashMap<>();
        response.put("success", result);
        response.put("message", result
                ? "장애 알림 이메일 발송 성공!"
                : "장애 알림 이메일 발송 실패!");

        return ResponseEntity.ok(response);
    }
}