package com.netpulse.service;

import com.netpulse.entity.Customer;
import com.netpulse.entity.Customer.CustomerStatus;
import com.netpulse.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;

    // 고객사 전체 조회
    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    // 고객사 단건 조회
    public Customer getCustomer(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("고객사를 찾을 수 없습니다. ID: " + id));
    }

    // 고객사 등록
    @Transactional
    public Customer createCustomer(Customer customer) {
        log.info("고객사 등록: {}", customer.getCompanyName());
        return customerRepository.save(customer);
    }

    // 고객사 수정
    @Transactional
    public Customer updateCustomer(Long id, Customer customer) {
        Customer existing = getCustomer(id);
        existing.setCompanyName(customer.getCompanyName());
        existing.setManagerName(customer.getManagerName());
        existing.setPhone(customer.getPhone());
        existing.setAddress(customer.getAddress());
        existing.setEmail(customer.getEmail());
        existing.setContractExpiry(customer.getContractExpiry());
        log.info("고객사 수정: {}", existing.getCompanyName());
        return customerRepository.save(existing);
    }

    // 고객사 삭제
    @Transactional
    public void deleteCustomer(Long id) {
        Customer customer = getCustomer(id);
        log.info("고객사 삭제: {}", customer.getCompanyName());
        customerRepository.delete(customer);
    }

    // 상태별 고객사 조회
    public List<Customer> getCustomersByStatus(CustomerStatus status) {
        return customerRepository.findByStatus(status);
    }

    // 회사명 검색
    public List<Customer> searchCustomers(String keyword) {
        return customerRepository.findByCompanyNameContaining(keyword);
    }

    // 계약만료 임박 고객사 조회 (30일 이내)
    public List<Customer> getExpiringCustomers() {
        LocalDate thirtyDaysLater = LocalDate.now().plusDays(30);
        return customerRepository.findByContractExpiryBefore(thirtyDaysLater);
    }
}
