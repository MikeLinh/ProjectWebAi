package com.source.controller;

import com.source.service.ProductService;
import com.source.model.Product;
import com.source.model.ProductReview;
import com.source.service.ProductReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/products/{productId}/reviews")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductReviewController {

    @Autowired
    private ProductReviewService reviewService;

    @Autowired
    private ProductService productService;

    @GetMapping
    public ResponseEntity<List<ProductReview>> getReviews(@PathVariable Integer productId) {
        return ResponseEntity.ok(reviewService.getReviewsByProductId(productId));
    }

    @PostMapping
    public ResponseEntity<?> createReview(@PathVariable Integer productId, @RequestBody ProductReview review) {
        try {
            ProductReview savedReview = reviewService.addReview(productId, review);
            return ResponseEntity.ok(savedReview);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Có lỗi xảy ra trong quá trình lưu đánh giá.");
        }
    }
    
}