package com.netpulse.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "kakao_token")
@Getter
@Setter
@NoArgsConstructor
public class KakaoToken {

    @Id
    private Long id = 1L;

    @Column(length = 3000)
    private String accessToken;

    @Column(length = 3000)
    private String refreshToken;

    private LocalDateTime accessTokenExpiresAt;

    private LocalDateTime refreshTokenExpiresAt;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}