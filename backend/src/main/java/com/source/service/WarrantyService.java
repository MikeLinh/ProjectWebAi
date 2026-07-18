package com.source.service;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.source.model.Order;
import com.source.model.OrderDetail;
import com.source.model.Warranty;
import com.source.repository.WarrantyRepository;

import jakarta.transaction.Transactional;

@Service
public class WarrantyService {

    @Autowired
    private WarrantyRepository warrantyRepository;

    @Transactional
    public void createWarrantiesForOrder(Order order) {
    if (order.getItems() != null) {
        for (OrderDetail detail : order.getItems()) {
            
            Warranty warranty = new Warranty();
            warranty.setOrderDetail(detail);
            
            //Tự động sinh mã bảo hành duy nhất (Tránh trùng thuộc tính unique)
            String randomCode = "BH-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            warranty.setWarrantyCode(randomCode);
            
            //Thiết lập số tháng bảo hành (Ví dụ mặc định là 12 tháng)
            int months = 12;
            warranty.setWarrantyMonth(months);
            
            //Sử dụng đúng setStartDate và setEndDate theo Entity của bạn
            LocalDateTime now = LocalDateTime.now();
            warranty.setStartDate(now);
            warranty.setEndDate(now.plusMonths(months));
            
            //Các thông tin bổ sung khác
            warranty.setStatus("ACTIVE");
            warranty.setCreatedAt(now);
            
            warrantyRepository.save(warranty);
        }
    }
}
}