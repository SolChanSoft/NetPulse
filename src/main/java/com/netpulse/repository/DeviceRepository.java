package com.netpulse.repository;

import com.netpulse.entity.Device;
import com.netpulse.entity.Device.DeviceStatus;
import com.netpulse.entity.Device.DeviceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DeviceRepository
        extends JpaRepository<Device, Long> {

    // 고객사별 장비 조회
    List<Device> findByCustomerId(Long customerId);

    // 상태별 장비 조회
    List<Device> findByStatus(DeviceStatus status);

    // 장비유형별 조회
    List<Device> findByDeviceType(DeviceType deviceType);

    // IP주소로 조회
    Device findByIpAddress(String ipAddress);

    // 장애 장비 조회
    List<Device> findByStatusNot(DeviceStatus status);
}