package com.netpulse.controller;

import com.netpulse.entity.AdminUser;
import com.netpulse.repository.AdminUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminAuthController {

    private final AdminUserRepository
            adminUserRepository;

    // 관리자 로그인
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>>
    adminLogin(
            @RequestBody Map<String, String>
                    request) {
        String username = request.get("username");
        String password = request.get("password");

        Map<String, Object> response =
                new HashMap<>();

        Optional<AdminUser> admin =
                adminUserRepository
                        .findByUsernameAndPassword(
                                username, password);

        if (admin.isPresent()) {
            response.put("success", true);
            response.put("username",
                    admin.get().getUsername());
            response.put("name", admin.get().getName());
            response.put("message", "로그인 성공!");
            log.info("관리자 로그인 성공: {}", username);
        } else {
            response.put("success", false);
            response.put("message",
                    "아이디 또는 비밀번호가 틀렸습니다.");
            log.warn("관리자 로그인 실패: {}", username);
        }

        return ResponseEntity.ok(response);
    }

    // 초기 관리자 계정 생성 (최초 1회)
    @PostMapping("/init")
    public ResponseEntity<String> initAdmin() {
        if (adminUserRepository.count() > 0) {
            return ResponseEntity.ok(
                    "이미 관리자 계정이 있습니다!");
        }

        AdminUser admin = AdminUser.builder()
                .username("admin")
                .password("netpulse1234!")
                .name("관리자")
                .build();

        adminUserRepository.save(admin);
        return ResponseEntity.ok(
                "관리자 계정 생성 완료!");
    }
}