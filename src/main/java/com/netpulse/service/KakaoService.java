package com.netpulse.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class KakaoService {

    @Value("${kakao.api.key}")
    private String kakaoApiKey;

    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper objectMapper;

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
        params.add("redirect_uri",
                "http://localhost:8080/kakao/callback");
        params.add("code", authCode);

        try {
            String response = webClient.post()
                    .uri("/oauth/token")
                    .contentType(
                            MediaType.APPLICATION_FORM_URLENCODED)
                    .body(BodyInserters.fromFormData(params))
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            log.info("카카오 토큰 발급 성공");
            return response;

        } catch (Exception e) {
            log.error("카카오 토큰 발급 실패: {}",
                    e.getMessage());
            return null;
        }
    }

    // ─────────────────────────────────────────
    // 카카오 나에게 메시지 전송
    // ─────────────────────────────────────────
    public boolean sendMessageToMe(String accessToken,
                                   String message) {
        WebClient webClient = webClientBuilder
                .baseUrl("https://kapi.kakao.com")
                .build();

        try {
            // ObjectMapper 로 JSON 안전하게 생성
            Map<String, Object> link = new HashMap<>();
            link.put("web_url", "http://localhost:8080");
            link.put("mobile_web_url",
                    "http://localhost:8080");

            Map<String, Object> template = new HashMap<>();
            template.put("object_type", "text");
            template.put("text", message);
            template.put("link", link);

            // JSON 직렬화
            String templateJson =
                    objectMapper.writeValueAsString(template);

            log.info("전송 템플릿: {}", templateJson);

            MultiValueMap<String, String> formData =
                    new LinkedMultiValueMap<>();
            formData.add("template_object", templateJson);

            String response = webClient.post()
                    .uri("/v2/api/talk/memo/default/send")
                    .header("Authorization",
                            "Bearer " + accessToken)
                    .contentType(
                            MediaType.APPLICATION_FORM_URLENCODED)
                    .body(BodyInserters.fromFormData(formData))
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            log.info("카카오 메시지 전송 성공: {}", response);
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
        String now = LocalDateTime.now()
                .format(DateTimeFormatter
                        .ofPattern("yyyy-MM-dd HH:mm:ss"));

        // 줄바꿈 없이 한줄로 작성
        String message =
                "[NetPulse 장애알림] " +
                        "장비명:" + deviceName + " / " +
                        "IP:" + ipAddress + " / " +
                        "내용:" + description + " / " +
                        "발생:" + now;

        return sendMessageToMe(accessToken, message);
    }

    // ─────────────────────────────────────────
    // 계약만료 임박 알림 메시지 전송
    // ─────────────────────────────────────────
    public boolean sendExpiryAlert(String accessToken,
                                   String companyName,
                                   String expiryDate) {
        String message =
                "[NetPulse 계약만료알림] " +
                        "고객사:" + companyName + " / " +
                        "만료일:" + expiryDate +
                        " / 계약갱신을 확인해주세요!";

        return sendMessageToMe(accessToken, message);
    }
}