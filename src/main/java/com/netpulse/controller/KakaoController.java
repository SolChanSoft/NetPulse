package com.netpulse.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
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

        log.info("카카오 인증 코드: {}", code);

        String tokenResponse =
                kakaoService.getAccessToken(code);

        try {
            ObjectMapper mapper = new ObjectMapper();
            Map<String, Object> tokenMap =
                    mapper.readValue(tokenResponse, Map.class);

            String accessToken =
                    (String) tokenMap.get("access_token");

            log.info("발급된 액세스 토큰: {}", accessToken);

            Map<String, String> result = new HashMap<>();
            result.put("access_token", accessToken);

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            log.error("토큰 파싱 오류: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "error", "토큰 파싱 실패",
                            "raw", tokenResponse != null
                                    ? tokenResponse : "null"
                    ));
        }
    }

    // 테스트 메시지 전송
    @PostMapping("/send")
    public ResponseEntity<Boolean> sendMessage(
            @RequestParam String accessToken,
            @RequestParam String message) {
        boolean result =
                kakaoService.sendMessageToMe(
                        accessToken, message);
        return ResponseEntity.ok(result);
    }

    // 장애 알림 테스트
    @PostMapping("/alert/incident")
    public ResponseEntity<Boolean> sendIncidentAlert(
            @RequestParam String accessToken,
            @RequestParam String deviceName,
            @RequestParam String ipAddress,
            @RequestParam String description) {
        boolean result =
                kakaoService.sendIncidentAlert(
                        accessToken,
                        deviceName,
                        ipAddress,
                        description);
        return ResponseEntity.ok(result);
    }

    // 카카오 토큰 업데이트
    @PostMapping("/token/update")
    public ResponseEntity<String> updateToken(
            @RequestParam String accessToken) {
        monitoringScheduler.updateKakaoToken(accessToken);
        return ResponseEntity.ok("토큰 업데이트 완료!");
    }
}