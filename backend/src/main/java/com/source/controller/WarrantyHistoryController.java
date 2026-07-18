package com.source.controller;

import com.source.model.WarrantyHistory;
import com.source.repository.WarrantyHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/warranty-histories")
@CrossOrigin(origins = "http://localhost:5173")
public class WarrantyHistoryController {

    @Autowired
    private WarrantyHistoryRepository historyRepository;

    //Lấy toàn bộ lịch sử
    @GetMapping
    public List<WarrantyHistory> getAll() {
        return historyRepository.findAll();
    }


    @GetMapping("/warranty/{warrantyId}")
    public ResponseEntity<?> getHistoryByWarrantyId(@PathVariable Integer warrantyId) {
        List<WarrantyHistory> histories = historyRepository.findByWarranty_WarrantyIdOrderByReceivedDateDesc(warrantyId);
        return ResponseEntity.ok(histories);
    }

    //Thêm một mốc lịch sử sửa chữa mới
    @PostMapping
    public ResponseEntity<?> create(@RequestBody WarrantyHistory history) {
        if (history.getWarranty() == null || history.getWarranty().getWarrantyId() == null) {
            return ResponseEntity.badRequest().body("Thiếu warrantyId cho lịch sử bảo hành");
        }
        if (history.getStatus() == null || history.getStatus().isBlank()) {
            history.setStatus("RECEIVED");
        }
        if ("RETURNED".equals(history.getStatus()) && history.getReturnedDate() == null) {
            history.setReturnedDate(java.time.LocalDateTime.now());
        }
        return ResponseEntity.ok(historyRepository.save(history));
    }
}