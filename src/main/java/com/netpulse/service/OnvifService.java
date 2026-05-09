package com.netpulse.service;

import com.netpulse.entity.Camera;
import com.netpulse.entity.Camera.CameraStatus;
import com.netpulse.repository.CameraRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.client.CredentialsProvider;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.BasicCredentialsProvider;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class OnvifService {

    private final CameraRepository cameraRepository;
    private final IncidentLogService incidentLogService;

    // ONVIF GetDeviceInformation SOAP 메시지
    private static final String SOAP_GET_DEVICE_INFO = """
        <?xml version="1.0" encoding="UTF-8"?>
        <soap:Envelope
            xmlns:soap="http://www.w3.org/2003/05/soap-envelope"
            xmlns:tds="http://www.onvif.org/ver10/device/wsdl">
            <soap:Body>
                <tds:GetDeviceInformation/>
            </soap:Body>
        </soap:Envelope>
        """;

    // ONVIF GetSystemDateAndTime SOAP 메시지
    private static final String SOAP_GET_DATE_TIME = """
        <?xml version="1.0" encoding="UTF-8"?>
        <soap:Envelope
            xmlns:soap="http://www.w3.org/2003/05/soap-envelope"
            xmlns:tds="http://www.onvif.org/ver10/device/wsdl">
            <soap:Body>
                <tds:GetSystemDateAndTime/>
            </soap:Body>
        </soap:Envelope>
        """;

    // ─────────────────────────────────────────
    // 카메라 ONVIF 연결 체크
    // ─────────────────────────────────────────
    public boolean checkOnvif(String ipAddress,
                              int port,
                              String username,
                              String password) {
        String url = "http://" + ipAddress
                + ":" + port + "/onvif/device_service";

        try {
            // 인증 설정
            CredentialsProvider credProvider =
                    new BasicCredentialsProvider();
            credProvider.setCredentials(
                    AuthScope.ANY,
                    new UsernamePasswordCredentials(
                            username, password));

            // 타임아웃 설정
            RequestConfig requestConfig =
                    RequestConfig.custom()
                            .setConnectTimeout(5000)
                            .setSocketTimeout(5000)
                            .build();

            CloseableHttpClient httpClient =
                    HttpClients.custom()
                            .setDefaultCredentialsProvider(
                                    credProvider)
                            .setDefaultRequestConfig(
                                    requestConfig)
                            .build();

            // SOAP 요청
            HttpPost httpPost = new HttpPost(url);
            httpPost.setHeader(
                    "Content-Type",
                    "application/soap+xml;charset=UTF-8");
            httpPost.setEntity(new StringEntity(
                    SOAP_GET_DATE_TIME, "UTF-8"));

            CloseableHttpResponse response =
                    httpClient.execute(httpPost);

            int statusCode = response.getStatusLine()
                    .getStatusCode();
            String responseBody = EntityUtils
                    .toString(response.getEntity());

            httpClient.close();

            // 200 또는 400 응답이면 카메라 정상
            // (400은 인증 실패지만 카메라는 살아있음)
            if (statusCode == 200 ||
                    statusCode == 400) {
                log.info("ONVIF 연결 성공: {} - {}",
                        ipAddress, statusCode);
                return true;
            }

            log.warn("ONVIF 연결 실패: {} - {}",
                    ipAddress, statusCode);
            return false;

        } catch (Exception e) {
            log.error("ONVIF 체크 오류: {} - {}",
                    ipAddress, e.getMessage());
            return false;
        }
    }

    // ─────────────────────────────────────────
    // RTSP 스트림 연결 체크 (Ping 으로 대체)
    // ─────────────────────────────────────────
    public boolean checkRtsp(String ipAddress) {
        try {
            java.net.InetAddress address =
                    java.net.InetAddress.getByName(ipAddress);
            boolean reachable =
                    address.isReachable(3000);
            log.info("RTSP Ping 체크 - IP: {} 결과: {}",
                    ipAddress,
                    reachable ? "성공" : "실패");
            return reachable;
        } catch (Exception e) {
            log.error("RTSP 체크 오류: {} - {}",
                    ipAddress, e.getMessage());
            return false;
        }
    }

    // ─────────────────────────────────────────
    // 카메라 상태 체크 및 저장
    // ─────────────────────────────────────────
    @Transactional
    public Camera checkCameraStatus(Camera camera) {
        log.info("카메라 체크 시작: {} ({})",
                camera.getCameraName(),
                camera.getIpAddress());

        boolean onvifResult = false;
        boolean pingResult = false;

        // ONVIF 체크
        if (camera.getUsername() != null
                && !camera.getUsername().isEmpty()) {
            onvifResult = checkOnvif(
                    camera.getIpAddress(),
                    camera.getPort(),
                    camera.getUsername(),
                    camera.getPassword());
        }

        // Ping 체크 (ONVIF 실패 시 Ping 으로 확인)
        if (!onvifResult) {
            pingResult = checkRtsp(
                    camera.getIpAddress());
        }

        // 상태 업데이트
        boolean isOnline = onvifResult || pingResult;
        CameraStatus newStatus = isOnline
                ? CameraStatus.NORMAL
                : CameraStatus.ERROR;

        camera.setStatus(newStatus);
        camera.setLastCheckedAt(LocalDateTime.now());
        cameraRepository.save(camera);

        // 장애 시 로그
        if (!isOnline) {
            log.warn("카메라 장애 감지: {} ({})",
                    camera.getCameraName(),
                    camera.getIpAddress());
        } else {
            log.info("카메라 정상: {} ({})",
                    camera.getCameraName(),
                    camera.getIpAddress());
        }

        return camera;
    }

    // ─────────────────────────────────────────
    // 전체 카메라 상태 체크
    // ─────────────────────────────────────────
    @Transactional
    public void checkAllCameras() {
        log.info("=== 전체 카메라 체크 시작 ===");
        List<Camera> cameras =
                cameraRepository.findAll();

        if (cameras.isEmpty()) {
            log.info("등록된 카메라가 없습니다.");
            return;
        }

        for (Camera camera : cameras) {
            try {
                checkCameraStatus(camera);
            } catch (Exception e) {
                log.error("카메라 체크 오류: {} - {}",
                        camera.getCameraName(),
                        e.getMessage());
            }
        }
        log.info("=== 전체 카메라 체크 완료 ===");
    }
}