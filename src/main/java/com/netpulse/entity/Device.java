package com.netpulse.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "device")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Device {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;         // 고객사 연결

    @Column(nullable = false, length = 100)
    private String deviceName;         // 장비명

    @Enumerated(EnumType.STRING)
    private DeviceType deviceType;     // 장비유형

    @Column(length = 20)
    private String ipAddress;          // IP주소

    @Column(length = 50)
    private String manufacturer;       // 제조사

    @Column(length = 50)
    private String modelName;          // 모델명

    @Column(length = 100)
    private String location;           // 설치위치

    private LocalDate installDate;     // 설치일

    @Enumerated(EnumType.STRING)
    private DeviceStatus status;       // 장비상태

    @Column(length = 200)
    private String snmpCommunity;      // SNMP Community String

    private Integer snmpPort;          // SNMP 포트 (기본 161)

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.status = DeviceStatus.NORMAL;
        this.snmpPort = 161;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // 장비 유형
    public enum DeviceType {
        SWITCH,     // 스위치
        EXCHANGE,   // 교환기
        ROUTER,     // 라우터
        SERVER,     // 서버
        FIREWALL,   // 방화벽
        OTHER       // 기타
    }

    // 장비 상태
    public enum DeviceStatus {
        NORMAL,     // 정상
        WARNING,    // 경고
        ERROR,      // 장애
        UNKNOWN     // 알수없음
    }
}