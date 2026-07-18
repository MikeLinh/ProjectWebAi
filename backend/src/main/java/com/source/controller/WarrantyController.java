package com.source.controller;

import com.source.model.Warranty;
import com.source.repository.WarrantyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/warranties")
@CrossOrigin(origins = "http://localhost:5173")
public class WarrantyController {

    @Autowired 
    private WarrantyRepository warrantyRepository;

    @GetMapping
    public ResponseEntity<List<Warranty>> getAll() {
        return ResponseEntity.ok(warrantyRepository.findAllByOrderByCreatedAtDesc());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Warranty> getById(@PathVariable Integer id) {
        return warrantyRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

   @GetMapping("/user/{userId}")
    public ResponseEntity<List<Warranty>> getWarrantiesByUser(@PathVariable Integer userId) {
        List<Warranty> userWarranties = warrantyRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return ResponseEntity.ok(userWarranties);
    }
    @PostMapping
    public ResponseEntity<Warranty> create(@RequestBody Warranty warranty) {
        // Tự động set ngày bắt đầu nếu chưa có
        if (warranty.getStartDate() == null) {
            warranty.setStartDate(LocalDateTime.now());
        }
        // Tính toán ngày kết thúc dựa trên số tháng bảo hành nếu có
        if (warranty.getWarrantyMonth() != null && warranty.getEndDate() == null) {
            warranty.setEndDate(warranty.getStartDate().plusMonths(warranty.getWarrantyMonth()));
        }
        Warranty saved = warrantyRepository.save(warranty);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Warranty> update(@PathVariable Integer id, @RequestBody Warranty updated) {
        Optional<Warranty> opt = warrantyRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Warranty existing = opt.get();
        existing.setOrderDetail(updated.getOrderDetail());
        existing.setWarrantyCode(updated.getWarrantyCode());
        existing.setWarrantyMonth(updated.getWarrantyMonth());
        existing.setStartDate(updated.getStartDate());
        existing.setEndDate(updated.getEndDate());
        existing.setStatus(updated.getStatus());
        existing.setNote(updated.getNote());

        return ResponseEntity.ok(warrantyRepository.save(existing));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        if (!warrantyRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        warrantyRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
    @GetMapping("/detail/{orderDetailId}")
    public ResponseEntity<Warranty> getByOrderDetailId(@PathVariable Long orderDetailId) {
        return warrantyRepository.findByOrderDetail_OrderDetailId(orderDetailId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
}