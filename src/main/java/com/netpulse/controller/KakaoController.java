package com.netpulse.controller;

import com.netpulse.service.KakaoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

@Slf4j
@RestController
@RequestMapping("/kakao")
@RequiredArgsConstructor
public class KakaoController {

    private final KakaoService kakaoService;

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
    public ResponseEntity<String> kakaoCallback(
            @RequestParam String code) {
        log.info("카카오 인증 코드: {}", code);
        String tokenResponse =
                kakaoService.getAccessToken(code);
        return ResponseEntity.ok(tokenResponse);
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
}