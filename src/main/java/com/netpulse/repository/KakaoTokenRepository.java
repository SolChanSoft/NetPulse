package com.netpulse.repository;

import com.netpulse.entity.KakaoToken;
import org.springframework.data.jpa.repository.JpaRepository;

public interface KakaoTokenRepository extends JpaRepository<KakaoToken, Long> {
}