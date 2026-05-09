package com.netpulse.controller;

import com.netpulse.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;

@Slf4j
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    // 월간 리포트 PDF 다운로드
    @GetMapping("/monthly/{customerId}")
    public ResponseEntity<byte[]> getMonthlyReport(
            @PathVariable Long customerId,
            @RequestParam(required = false)
            Integer year,
            @RequestParam(required = false)
            Integer month) {

        // 기본값: 현재 월
        if (year == null) {
            year = LocalDate.now().getYear();
        }
        if (month == null) {
            month = LocalDate.now().getMonthValue();
        }

        byte[] pdf = reportService
                .generateMonthlyReport(
                        customerId, year, month);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(
                MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData(
                "attachment",
                String.format("NetPulse_%d년%d월_리포트.pdf",
                        year, month));

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdf);
    }
}