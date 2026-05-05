package com.netpulse.repository;

import com.netpulse.entity.Customer;
import com.netpulse.entity.Customer.CustomerStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface CustomerRepository
        extends JpaRepository<Customer, Long> {

    // 상태별 고객사 조회
    List<Customer> findByStatus(CustomerStatus status);

    // 회사명으로 검색
    List<Customer> findByCompanyNameContaining(String companyName);

    // 계약만료일 이전 고객사 조회
    List<Customer> findByContractExpiryBefore(LocalDate date);
}