package com.source.controller;

import com.source.model.Promotion;
import com.source.repository.PromotionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/promotions")
@CrossOrigin(origins = "http://localhost:5173")
public class PromotionController {

    @Autowired
    private PromotionRepository promotionRepository;

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