package com.source.repository;

import com.source.model.ProductReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductReviewRepository extends JpaRepository<ProductReview, Long> {
    
    List<ProductReview> findByProductId(Integer productId);
    long countByProductId(Integer productId);   
    boolean existsByProductIdAndUserId(Integer productId, Long userId);
}