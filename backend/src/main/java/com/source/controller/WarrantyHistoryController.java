package com.source.controller;

import com.source.model.WarrantyHistory;
import com.source.repository.WarrantyHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/warranty-histories")
@CrossOrigin("*")
public class WarrantyHistoryController {

    @Autowired
    private WarrantyHistoryRepository historyRepository;

    // Lấy toàn bộ lịch sử
    @GetMapping
    public List<WarrantyHistory> getAll() {
        return historyRepository.findAll();
    }

    // Lấy lịch sử theo ID của thẻ bảo hành (Xem thẻ bảo hành này từng sửa chữa/cập nhật những gì)
    @GetMapping("/warranty/{warrantyId}")
    public List<WarrantyHistory> getByWarrantyId(@PathVariable Integer warrantyId) {
        return historyRepository.findByWarranty_WarrantyId(warrantyId);
    }

    // Thêm một mốc lịch sử bảo hành mới (Ví dụ: Đã tiếp nhận máy, Đang sửa, Đã trả khách)
    @PostMapping
    public WarrantyHistory create(@RequestBody WarrantyHistory history) {
        return historyRepository.save(history);
    }
}