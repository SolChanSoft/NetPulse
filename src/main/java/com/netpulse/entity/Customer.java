package com.netpulse.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "customer")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String companyName;        // 회사명

    @Column(length = 50)
    private String managerName;        // 담당자명

    @Column(length = 20)
    private String phone;              // 연락처

    @Column(length = 200)
    private String address;            // 주소

    @Column(length = 100)
    private String email;              // 이메일

    private LocalDate contractExpiry;  // 계약만료일

    @Enumerated(EnumType.STRING)
    private CustomerStatus status;     // 상태

    @Column(updatable = false)
    private LocalDateTime createdAt;   // 등록일시

    private LocalDateTime updatedAt;   // 수정일시

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.status = CustomerStatus.ACTIVE;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // 고객사 상태
    public enum CustomerStatus {
        ACTIVE,    // 정상
        INACTIVE,  // 비활성
        EXPIRED    // 계약만료
    }
}