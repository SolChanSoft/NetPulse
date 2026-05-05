package com.netpulse.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Slf4j
@Service
@RequiredArgsConstructor
public class KakaoService {

    @Value("${kakao.api.key}")
    private String kakaoApiKey;

    @Value("${kakao.oauth.redirect-uri}")
    private String kakaoRedirectUri;

    @Value("${kakao.oauth.client-secret:}")
    private String kakaoClientSecret;

    private final WebClient.Builder webClientBuilder;

    // ─────────────────────────────────────────
    // 카카오 액세스 토큰 발급
    // ─────────────────────────────────────────
    public String getAccessToken(String authCode) {
        WebClient webClient = webClientBuilder
                .baseUrl("https://kauth.kakao.com")
                .build();

        MultiValueMap<String, String> params =
                new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", kakaoApiKey);
        params.add("redirect_uri", kakaoRedirectUri);
        params.add("code", authCode);

        if (kakaoClientSecret != null && !kakaoClientSecret.isBlank()) {
            params.add("client_secret", kakaoClientSecret);
        }

        try {
            String response = webClient.post()
                    .uri("/oauth/token")
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(BodyInserters.fromFormData(params))
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, clientResponse ->
                            clientResponse.bodyToMono(String.class)
                                    .flatMap(errorBody -> {
                                        log.error("카카오 토큰 발급 응답 오류: {}", errorBody);
                                        return Mono.error(new RuntimeException(errorBody));
                                    })
                    )
                    .bodyToMono(String.class)
                    .block();

            log.info("카카오 토큰 발급 성공");
            return response;

        } catch (Exception e) {
            log.error("카카오 토큰 발급 실패: {}", e.getMessage());
            return null;
        }
    }

    // ─────────────────────────────────────────
    // 카카오 나에게 메시지 전송 (테스트용)
    // ─────────────────────────────────────────
    public boolean sendMessageToMe(String accessToken,
                                   String message) {
        WebClient webClient = webClientBuilder
                .baseUrl("https://kapi.kakao.com")
                .build();

        // 메시지 템플릿 (텍스트형)
        String template = """
            {
                "object_type": "text",
                "text": "%s",
                "link": {
                    "web_url": "http://localhost:8080",
                    "mobile_web_url": "http://localhost:8080"
                }
            }
            """.formatted(message);

        try {
            webClient.post()
                    .uri("/v2/api/talk/memo/default/send")
                    .header("Authorization",
                            "Bearer " + accessToken)
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(BodyInserters.fromFormData(
                            "template_object", template))
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            log.info("카카오 메시지 전송 성공");
            return true;

        } catch (Exception e) {
            log.error("카카오 메시지 전송 실패: {}",
                    e.getMessage());
            return false;
        }
    }

    // ─────────────────────────────────────────
    // 장애 알림 메시지 전송
    // ─────────────────────────────────────────
    public boolean sendIncidentAlert(String accessToken,
                                     String deviceName,
                                     String ipAddress,
                                     String description) {
        String message = """
                🚨 [NetPulse 장애 알림]
                
                장비명 : %s
                IP주소 : %s
                내용   : %s
                발생시간: %s
                
                즉시 확인이 필요합니다!
                """.formatted(
                deviceName,
                ipAddress,
                description,
                java.time.LocalDateTime.now()
                        .format(java.time.format.DateTimeFormatter
                                .ofPattern("yyyy-MM-dd HH:mm:ss"))
        );

        return sendMessageToMe(accessToken, message);
    }

    // ─────────────────────────────────────────
    // 계약만료 임박 알림 메시지 전송
    // ─────────────────────────────────────────
    public boolean sendExpiryAlert(String accessToken,
                                   String companyName,
                                   String expiryDate) {
        String message = """
                ⚠️ [NetPulse 계약만료 알림]
                
                고객사  : %s
                만료일  : %s
                
                계약 갱신을 확인해 주세요!
                """.formatted(companyName, expiryDate);

        return sendMessageToMe(accessToken, message);
    }

    public String getKakaoClientSecret() {
        return kakaoClientSecret;
    }

    public void setKakaoClientSecret(String kakaoClientSecret) {
        this.kakaoClientSecret = kakaoClientSecret;
    }
}