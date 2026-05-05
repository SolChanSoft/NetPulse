package com.netpulse.service;

import com.netpulse.entity.Customer;
import com.netpulse.entity.Device;
import com.netpulse.entity.Device.DeviceStatus;
import com.netpulse.repository.CustomerRepository;
import com.netpulse.repository.DeviceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class DeviceService {

    private final DeviceRepository deviceRepository;
    private final CustomerRepository customerRepository;

    // 장비 전체 조회
    public List<Device> getAllDevices() {
        return deviceRepository.findAll();
    }

    // 장비 단건 조회
    public Device getDevice(Long id) {
        return deviceRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("장비를 찾을 수 없습니다. ID: " + id));
    }

    // 고객사별 장비 조회
    public List<Device> getDevicesByCustomer(Long customerId) {
        return deviceRepository.findByCustomerId(customerId);
    }

    // 장비 등록
    // createDevice 메서드 수정
    @Transactional
    public Device createDevice(Device device) {
        // 고객사 존재 여부 확인
        Long customerId = device.getCustomer().getId();
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "고객사를 찾을 수 없습니다. ID: " + customerId));

        device.setCustomer(customer);
        log.info("장비 등록: {} (고객사: {})",
                device.getDeviceName(),
                customer.getCompanyName());
        return deviceRepository.save(device);
    }

    // 장비 수정
    @Transactional
    public Device updateDevice(Long id, Device device) {
        Device existing = getDevice(id);
        existing.setDeviceName(device.getDeviceName());
        existing.setDeviceType(device.getDeviceType());
        existing.setIpAddress(device.getIpAddress());
        existing.setManufacturer(device.getManufacturer());
        existing.setModelName(device.getModelName());
        existing.setLocation(device.getLocation());
        existing.setSnmpCommunity(device.getSnmpCommunity());
        existing.setSnmpPort(device.getSnmpPort());
        log.info("장비 수정: {}", existing.getDeviceName());
        return deviceRepository.save(existing);
    }

    // 장비 삭제
    @Transactional
    public void deleteDevice(Long id) {
        Device device = getDevice(id);
        log.info("장비 삭제: {}", device.getDeviceName());
        deviceRepository.delete(device);
    }

    // 장비 상태 변경
    @Transactional
    public Device updateDeviceStatus(Long id, DeviceStatus status) {
        Device device = getDevice(id);
        device.setStatus(status);
        log.info("장비 상태 변경: {} → {}", device.getDeviceName(), status);
        return deviceRepository.save(device);
    }

    // 장애 장비 조회
    public List<Device> getErrorDevices() {
        return deviceRepository.findByStatus(DeviceStatus.ERROR);
    }

    // 정상 장비 조회
    public List<Device> getNormalDevices() {
        return deviceRepository.findByStatus(DeviceStatus.NORMAL);
    }
}