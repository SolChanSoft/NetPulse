package com.netpulse.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.netpulse.entity.KakaoToken;
import com.netpulse.repository.KakaoTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
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

    private static final Long KAKAO_TOKEN_ID = 1L;

    @Value("${kakao.api.key}")
    private String kakaoApiKey;

    @Value("${kakao.oauth.redirect-uri}")
    private String kakaoRedirectUri;

    @Value("${kakao.oauth.client-secret:}")
    private String kakaoClientSecret;

    @Value("${netpulse.service.url}")
    private String serviceUrl;

    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper objectMapper;
    private final KakaoTokenRepository kakaoTokenRepository;

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

        if (kakaoClientSecret != null &&
                !kakaoClientSecret.isBlank()) {
            params.add("client_secret", kakaoClientSecret);
        }

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

    public KakaoToken saveTokenResponse(String tokenResponse) {
        try {
            Map<String, Object> tokenMap =
                    objectMapper.readValue(tokenResponse, Map.class);

            String accessToken =
                    (String) tokenMap.get("access_token");
            String refreshToken =
                    (String) tokenMap.get("refresh_token");

            Integer expiresIn =
                    (Integer) tokenMap.get("expires_in");
            Integer refreshTokenExpiresIn =
                    (Integer) tokenMap.get("refresh_token_expires_in");

            if (accessToken == null || accessToken.isBlank()) {
                throw new IllegalArgumentException(
                        "카카오 응답에 access_token이 없습니다.");
            }

            KakaoToken kakaoToken = kakaoTokenRepository
                    .findById(KAKAO_TOKEN_ID)
                    .orElseGet(KakaoToken::new);

            kakaoToken.setId(KAKAO_TOKEN_ID);
            kakaoToken.setAccessToken(accessToken);

            if (refreshToken != null && !refreshToken.isBlank()) {
                kakaoToken.setRefreshToken(refreshToken);
            }

            if (expiresIn != null) {
                kakaoToken.setAccessTokenExpiresAt(
                        LocalDateTime.now().plusSeconds(expiresIn));
            }

            if (refreshTokenExpiresIn != null) {
                kakaoToken.setRefreshTokenExpiresAt(
                        LocalDateTime.now()
                                .plusSeconds(refreshTokenExpiresIn));
            }

            KakaoToken savedToken =
                    kakaoTokenRepository.save(kakaoToken);

            log.info("카카오 토큰 DB 저장 완료");
            return savedToken;

        } catch (Exception e) {
            log.error("카카오 토큰 저장 실패: {}", e.getMessage());
            throw new IllegalStateException("카카오 토큰 저장 실패", e);
        }
    }

    public String getSavedAccessToken() {
        return kakaoTokenRepository.findById(KAKAO_TOKEN_ID)
                .map(KakaoToken::getAccessToken)
                .orElse(null);
    }

    public String refreshAccessToken() {
        KakaoToken kakaoToken = kakaoTokenRepository
                .findById(KAKAO_TOKEN_ID)
                .orElse(null);

        if (kakaoToken == null ||
                kakaoToken.getRefreshToken() == null ||
                kakaoToken.getRefreshToken().isBlank()) {
            log.warn("카카오 refresh_token 없음 - 토큰 갱신 불가");
            return null;
        }

        WebClient webClient = webClientBuilder
                .baseUrl("https://kauth.kakao.com")
                .build();

        MultiValueMap<String, String> params =
                new LinkedMultiValueMap<>();
        params.add("grant_type", "refresh_token");
        params.add("client_id", kakaoApiKey);
        params.add("refresh_token", kakaoToken.getRefreshToken());

        if (kakaoClientSecret != null &&
                !kakaoClientSecret.isBlank()) {
            params.add("client_secret", kakaoClientSecret);
        }

        try {
            String response = webClient.post()
                    .uri("/oauth/token")
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(BodyInserters.fromFormData(params))
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            Map<String, Object> tokenMap =
                    objectMapper.readValue(response, Map.class);

            String newAccessToken =
                    (String) tokenMap.get("access_token");
            String newRefreshToken =
                    (String) tokenMap.get("refresh_token");

            Integer expiresIn =
                    (Integer) tokenMap.get("expires_in");
            Integer refreshTokenExpiresIn =
                    (Integer) tokenMap.get("refresh_token_expires_in");

            if (newAccessToken == null || newAccessToken.isBlank()) {
                log.error("카카오 토큰 갱신 실패: access_token 없음");
                return null;
            }

            kakaoToken.setAccessToken(newAccessToken);

            if (newRefreshToken != null &&
                    !newRefreshToken.isBlank()) {
                kakaoToken.setRefreshToken(newRefreshToken);
            }

            if (expiresIn != null) {
                kakaoToken.setAccessTokenExpiresAt(
                        LocalDateTime.now().plusSeconds(expiresIn));
            }

            if (refreshTokenExpiresIn != null) {
                kakaoToken.setRefreshTokenExpiresAt(
                        LocalDateTime.now()
                                .plusSeconds(refreshTokenExpiresIn));
            }

            kakaoTokenRepository.save(kakaoToken);

            log.info("카카오 access_token 갱신 완료");
            return newAccessToken;

        } catch (Exception e) {
            log.error("카카오 access_token 갱신 실패: {}",
                    e.getMessage());
            return null;
        }
    }

    public String getValidAccessToken() {
        KakaoToken kakaoToken = kakaoTokenRepository
                .findById(KAKAO_TOKEN_ID)
                .orElse(null);

        if (kakaoToken == null ||
                kakaoToken.getAccessToken() == null ||
                kakaoToken.getAccessToken().isBlank()) {
            log.warn("저장된 카카오 access_token 없음");
            return null;
        }

        LocalDateTime expiresAt =
                kakaoToken.getAccessTokenExpiresAt();

        if (expiresAt != null &&
                expiresAt.isBefore(LocalDateTime.now().plusMinutes(5))) {
            log.info("카카오 access_token 만료 임박 - refresh_token으로 갱신 시도");
            return refreshAccessToken();
        }

        return kakaoToken.getAccessToken();
    }

    // ─────────────────────────────────────────
    // 카카오 나에게 메시지 전송
    // ─────────────────────────────────────────
    public boolean sendMessageToMe(String accessToken,
                                   String message) {
        boolean result = sendMessageToMeInternal(accessToken, message);

        if (result) {
            return true;
        }

        String refreshedAccessToken = refreshAccessToken();

        if (refreshedAccessToken == null ||
                refreshedAccessToken.isBlank()) {
            return false;
        }

        return sendMessageToMeInternal(refreshedAccessToken, message);
    }

    private boolean sendMessageToMeInternal(String accessToken,
                                            String message) {
        if (accessToken == null || accessToken.isBlank()) {
            log.warn("카카오 access_token 없음 - 메시지 전송 불가");
            return false;
        }

        WebClient webClient = webClientBuilder
                .baseUrl("https://kapi.kakao.com")
                .build();

        try {
            Map<String, Object> link = new HashMap<>();
            link.put("web_url", serviceUrl);
            link.put("mobile_web_url", serviceUrl);

            Map<String, Object> template = new HashMap<>();
            template.put("object_type", "text");
            template.put("text", message);
            template.put("link", link);

            String templateJson =
                    objectMapper.writeValueAsString(template);

            log.debug("카카오 메시지 템플릿 생성 완료");

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
                    .onStatus(HttpStatusCode::is4xxClientError,
                            clientResponse -> clientResponse
                                    .bodyToMono(String.class)
                                    .map(body -> new IllegalStateException(
                                            "카카오 메시지 전송 4xx 오류: " + body)))
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

        String message =
                "[NetPulse 장애알림] " +
                        "장비명:" + deviceName + " / " +
                        "IP:" + ipAddress + " / " +
                        "내용:" + description + " / " +
                        "발생:" + now;

        return sendMessageToMe(accessToken, message);
    }

    public boolean sendIncidentAlert(String deviceName,
                                     String ipAddress,
                                     String description) {
        String accessToken = getValidAccessToken();

        if (accessToken == null || accessToken.isBlank()) {
            log.warn("유효한 카카오 토큰 없음 - 장애 알림 전송 불가");
            return false;
        }

        return sendIncidentAlert(
                accessToken,
                deviceName,
                ipAddress,
                description);
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