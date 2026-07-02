package com.source.service;

import com.source.model.ProductReview;
import com.source.repository.ProductReviewRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class ProductReviewService {

    private final ProductReviewRepository reviewRepository;

    public ProductReviewService(ProductReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    @Transactional(readOnly = true)
    public List<ProductReview> getReviewsByProductId(Integer productId) {
        if (productId == null) {
            return List.of();
        }
        return reviewRepository.findByProductId(productId);
    }

    @Transactional
    public ProductReview addReview(Integer productId, ProductReview review) {
        review.setProductId(productId);  
        
        if (review.getRating() < 3 && (review.getComment() == null || review.getComment().trim().isBlank())) {
            throw new IllegalArgumentException("Đánh giá dưới 3 sao bắt buộc phải nhập nội dung nhận xét lý do.");
        }

        return reviewRepository.save(review);
    }
}