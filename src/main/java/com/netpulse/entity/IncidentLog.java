package com.netpulse.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "incident_log")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IncidentLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id")
    private Device device;             // 장비 연결

    private LocalDateTime occurredAt;  // 발생시간
    private LocalDateTime resolvedAt;  // 복구시간

    @Column(length = 500)
    private String description;        // 장애내용

    @Column(length = 500)
    private String resolution;         // 처리내용

    @Enumerated(EnumType.STRING)
    private IncidentStatus status;     // 처리상태

    @PrePersist
    public void prePersist() {
        this.occurredAt = LocalDateTime.now();
        this.status = IncidentStatus.OPEN;
    }

    // 장애 상태
    public enum IncidentStatus {
        OPEN,       // 발생
        INPROGRESS, // 처리중
        RESOLVED    // 해결
    }
}