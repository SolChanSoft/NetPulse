package com.netpulse.controller;

import com.netpulse.entity.KakaoToken;
import com.netpulse.service.KakaoService;
import com.netpulse.service.MonitoringScheduler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/kakao")
@RequiredArgsConstructor
public class KakaoController {

    private final KakaoService kakaoService;
    private final MonitoringScheduler monitoringScheduler;

    @Value("${kakao.api.key}")
    private String kakaoApiKey;

    @Value("${kakao.oauth.redirect-uri}")
    private String kakaoRedirectUri;

    // 카카오 로그인 URL 생성
    @GetMapping("/login")
    public ResponseEntity<String> kakaoLogin() {
        String loginUrl = UriComponentsBuilder
                .fromUriString("https://kauth.kakao.com/oauth/authorize")
                .queryParam("client_id", kakaoApiKey)
                .queryParam("redirect_uri", kakaoRedirectUri)
                .queryParam("response_type", "code")
                .queryParam("scope", "talk_message")
                .build()
                .toUriString();

        return ResponseEntity.ok(loginUrl);
    }

    // 카카오 로그인 콜백
    @GetMapping("/callback")
    public ResponseEntity<?> kakaoCallback(
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String error,
            @RequestParam(required = false)
            String error_description) {

        // 오류 발생 시
        if (error != null) {
            log.error("카카오 로그인 오류: {} - {}",
                    error, error_description);
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "error", error,
                            "error_description", error_description
                    ));
        }

        // code 없을 시
        if (code == null) {
            log.error("카카오 인증 코드 없음");
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "인증 코드가 없습니다"));
        }

        log.info("카카오 인증 코드 수신 완료");

        String tokenResponse =
                kakaoService.getAccessToken(code);

        if (tokenResponse == null || tokenResponse.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error",
                            "카카오 토큰 발급 실패"));
        }

        try {
            KakaoToken savedToken =
                    kakaoService.saveTokenResponse(tokenResponse);

            log.info("카카오 토큰 발급 및 DB 저장 완료");

            Map<String, String> result = new HashMap<>();
            result.put("message", "카카오 토큰 발급 및 저장 완료");
            result.put("accessTokenExpiresAt",
                    String.valueOf(savedToken.getAccessTokenExpiresAt()));
            result.put("refreshTokenExpiresAt",
                    String.valueOf(savedToken.getRefreshTokenExpiresAt()));

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            log.error("카카오 토큰 저장 오류: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "error", "카카오 토큰 저장 실패"
                    ));
        }
    }

    // 테스트 메시지 전송
    @PostMapping("/send")
    public ResponseEntity<Boolean> sendMessage(
            @RequestParam String message) {
        String accessToken = kakaoService.getValidAccessToken();

        if (accessToken == null || accessToken.isBlank()) {
            return ResponseEntity.badRequest().body(false);
        }

        boolean result =
                kakaoService.sendMessageToMe(
                        accessToken, message);
        return ResponseEntity.ok(result);
    }

    // 장애 알림 테스트
    @PostMapping("/alert/incident")
    public ResponseEntity<Boolean> sendIncidentAlert(
            @RequestParam String deviceName,
            @RequestParam String ipAddress,
            @RequestParam String description) {
        boolean result =
                kakaoService.sendIncidentAlert(
                        deviceName,
                        ipAddress,
                        description);
        return ResponseEntity.ok(result);
    }

    // 카카오 토큰 갱신
    @PostMapping("/token/refresh")
    public ResponseEntity<?> refreshToken() {
        String accessToken = kakaoService.refreshAccessToken();

        if (accessToken == null || accessToken.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error",
                            "카카오 토큰 갱신 실패"));
        }

        return ResponseEntity.ok(
                Map.of("message", "카카오 토큰 갱신 완료"));
    }

    // 카카오 토큰 업데이트
    @PostMapping("/token/update")
    public ResponseEntity<String> updateToken(
            @RequestParam String accessToken) {
        monitoringScheduler.updateKakaoToken(accessToken);
        return ResponseEntity.ok("토큰 업데이트 완료!");
    }
}