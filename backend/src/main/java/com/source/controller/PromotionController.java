package com.source.controller;

import com.source.model.Promotion;
import com.source.repository.PromotionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/promotions")
@CrossOrigin(origins = "http://localhost:5173")
public class PromotionController {

    @Autowired
    private PromotionRepository promotionRepository;

   @GetMapping("/validate")
    public ResponseEntity<?> validatePromotion(@RequestParam String code) {
        Optional<Promotion> promoOpt = promotionRepository.findByCouponCode(code.toUpperCase());

        if (promoOpt.isEmpty()) {
            // Sử dụng HashMap thay vì Map.of để an toàn với giá trị null
            Map<String, Object> errorBody = new HashMap<>();
            errorBody.put("success", false);
            errorBody.put("message", "Mã giảm giá không tồn tại!");
            return ResponseEntity.badRequest().body(errorBody);
        }

        Promotion promo = promoOpt.get();
        java.time.LocalDateTime now = java.time.LocalDateTime.now();

        // Kiểm tra ngày bắt đầu (Nếu có cài đặt)
        if (promo.getStartDate() != null && now.isBefore(promo.getStartDate())) {
            Map<String, Object> errorBody = new HashMap<>();
            errorBody.put("success", false);
            errorBody.put("message", "Mã giảm giá chưa đến thời gian áp dụng!");
            return ResponseEntity.badRequest().body(errorBody);
        }

        // Kiểm tra ngày kết thúc (Nếu có cài đặt)
        if (promo.getEndDate() != null && now.isAfter(promo.getEndDate())) {
            Map<String, Object> errorBody = new HashMap<>();
            errorBody.put("success", false);
            errorBody.put("message", "Mã giảm giá này đã hết hạn sử dụng!");
            return ResponseEntity.badRequest().body(errorBody);
        }

        // NẾU HỢP LỆ: Sử dụng HashMap để đóng gói trả về, tránh lỗi NullPointerException
        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("success", true);
        responseBody.put("promoId", promo.getPromoId());
        responseBody.put("couponCode", promo.getCouponCode());
        responseBody.put("discountValue", promo.getDiscountValue());
        responseBody.put("discountType", promo.getDiscountType());
        responseBody.put("minSpend", promo.getMinSpend() != null ? promo.getMinSpend() : 0); // Bảo vệ chống null
        responseBody.put("targetProductId", promo.getTargetProductId());
        responseBody.put("message", "Áp dụng mã giảm giá thành công!");

        return ResponseEntity.ok(responseBody);
    }

    @GetMapping
    public ResponseEntity<List<Promotion>> getAllPromotions() {
        return ResponseEntity.ok(promotionRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> createPromotion(@RequestBody Promotion promo) {
        if (promotionRepository.findByCouponCode(promo.getCouponCode()).isPresent()) {
            return ResponseEntity.badRequest().body("Mã code đã tồn tại!");
        }
        promo.setCouponCode(promo.getCouponCode().toUpperCase());
        Promotion saved = promotionRepository.save(promo);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePromotion(@PathVariable Integer id) {
        if (!promotionRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        promotionRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
   
}