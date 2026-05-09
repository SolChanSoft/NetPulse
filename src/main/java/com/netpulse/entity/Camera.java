package com.netpulse.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "camera")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Camera {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;         // 고객사 연결

    @Column(nullable = false, length = 100)
    private String cameraName;         // 카메라명

    @Column(length = 20)
    private String ipAddress;          // IP주소

    private Integer port;              // 포트 (기본 80)

    @Column(length = 50)
    private String username;           // 접속 아이디

    @Column(length = 50)
    private String password;           // 접속 비밀번호

    @Column(length = 200)
    private String rtspUrl;            // RTSP URL

    @Column(length = 100)
    private String location;           // 설치위치

    @Column(length = 50)
    private String manufacturer;       // 제조사

    @Column(length = 50)
    private String modelName;          // 모델명

    @Enumerated(EnumType.STRING)
    private CameraStatus status;       // 카메라 상태

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private LocalDateTime lastCheckedAt; // 마지막 체크시간

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.status = CameraStatus.UNKNOWN;
        this.port = 80;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // 카메라 상태
    public enum CameraStatus {
        NORMAL,   // 정상
        ERROR,    // 장애
        UNKNOWN   // 알수없음
    }
}