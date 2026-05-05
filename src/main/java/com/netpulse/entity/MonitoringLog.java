package com.netpulse.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "monitoring_log")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonitoringLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id")
    private Device device;             // 장비 연결

    private LocalDateTime collectedAt; // 수집시간

    private Double cpuUsage;           // CPU 사용률
    private Double memoryUsage;        // 메모리 사용률
    private Boolean pingStatus;        // Ping 응답
    private Integer responseTime;      // 응답시간(ms)

    @Column(length = 500)
    private String portStatus;         // 포트상태 (JSON)

    @PrePersist
    public void prePersist() {
        this.collectedAt = LocalDateTime.now();
    }
}
