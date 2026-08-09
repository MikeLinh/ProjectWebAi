package com.source.controller;

import com.source.service.ProductService;
import com.source.model.Product;
import com.source.model.ProductReview;
import com.source.repository.ProductRepository;
import com.source.repository.ProductReviewRepository;
import com.source.service.ProductReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
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
    
    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductReviewRepository productReviewRepository;

    //Lấy dữ liệu review dựa theo productID
    @GetMapping
    public ResponseEntity<List<ProductReview>> getReviews(@PathVariable Integer productId) {
        return ResponseEntity.ok(reviewService.getReviewsByProductId(productId));
    }
    //Tạo 1 review mới
    @PostMapping
    public ResponseEntity<?> createReview(@PathVariable Integer productId, @RequestBody ProductReview review) {
        if(review.getRating() == null || review.getRating() < 1 || review.getRating() > 5){
            return ResponseEntity.badRequest().body("Điểm đánh giá phải từ 1 đến 5 sao!");
        }
        if(review.getComment() == null || review.getComment().trim().isEmpty()){
            return ResponseEntity.badRequest().body("Nội dung đánh giá không được để trống");
        }
        if(review.getUserId() == null){
            return ResponseEntity.badRequest().body("Thông tin người đánh giá không hợp lệ!");
        }
        if(productReviewRepository.existsByProductIdAndUserId(productId, review.getUserId())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Người dùng đã đánh giá sản phẩm này!");
        }
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