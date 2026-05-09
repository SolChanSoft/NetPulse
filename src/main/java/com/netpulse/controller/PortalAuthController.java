package com.netpulse.controller;

import com.netpulse.entity.Customer;
import com.netpulse.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/portal")
@RequiredArgsConstructor
public class PortalAuthController {

    private final CustomerRepository customerRepository;

    // 고객사 포털 로그인
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>>
    portalLogin(
            @RequestBody Map<String, String> request) {
        String companyName = request.get("companyName");
        String phone = request.get("phone");

        log.info("포털 로그인 시도: {}", companyName);

        // 회사명 + 연락처로 인증
        Optional<Customer> customer =
                customerRepository
                        .findByCompanyNameContaining(companyName)
                        .stream()
                        .filter(c -> phone.equals(c.getPhone()))
                        .findFirst();

        Map<String, Object> response = new HashMap<>();

        if (customer.isPresent()) {
            Customer c = customer.get();
            response.put("success", true);
            response.put("customerId", c.getId());
            response.put("companyName", c.getCompanyName());
            response.put("managerName", c.getManagerName());
            response.put("message", "로그인 성공!");
            log.info("포털 로그인 성공: {}", companyName);
        } else {
            response.put("success", false);
            response.put("message",
                    "회사명 또는 연락처가 일치하지 않습니다.");
            log.warn("포털 로그인 실패: {}", companyName);
        }

        return ResponseEntity.ok(response);
    }

    // 고객사 대시보드 데이터
    @GetMapping("/dashboard/{customerId}")
    public ResponseEntity<Map<String, Object>>
    getPortalDashboard(
            @PathVariable Long customerId) {
        Map<String, Object> response = new HashMap<>();

        // 고객사 정보
        Customer customer = customerRepository
                .findById(customerId)
                .orElseThrow(() ->
                        new RuntimeException("고객사 없음"));

        response.put("companyName",
                customer.getCompanyName());
        response.put("managerName",
                customer.getManagerName());
        response.put("contractExpiry",
                customer.getContractExpiry());
        response.put("status", customer.getStatus());

        return ResponseEntity.ok(response);
    }
}