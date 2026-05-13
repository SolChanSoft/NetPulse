package com.netpulse.repository;

import com.netpulse.entity.AdminUser;
import org.springframework.data.jpa.repository
        .JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface AdminUserRepository
        extends JpaRepository<AdminUser, Long> {

    Optional<AdminUser> findByUsernameAndPassword(
            String username, String password);
}