package com.source.service;

import com.source.model.Order;
import com.source.model.OrderDetail;
import com.source.model.ProductReview;
import com.source.repository.OrderRepository;
import com.source.repository.ProductReviewRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class ProductReviewService {

    private final ProductReviewRepository reviewRepository;
    private final OrderRepository orderRepository;


    public ProductReviewService(ProductReviewRepository reviewRepository, OrderRepository orderRepository) {
        this.reviewRepository = reviewRepository;
        this.orderRepository = orderRepository;
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
        if(review.getUserId() == null){
            throw new IllegalArgumentException("Bạn phải cần đăng nhập để đánh giá sản phẩm");
        }
        if(!hasPurchaseAddReceived(review.getUserId(), productId)){
            throw new IllegalArgumentException("Bạn chỉ có thể đánh giá sản phẩm khi sản phẩm đã mua và giao hàng thành công!");
        }

        return reviewRepository.save(review);
    }

    private boolean hasPurchaseAddReceived(Long userId, Integer productId){
        List<Order> orders = orderRepository.findByUserIdOrderByOrderDateDesc(userId);
        for(Order order : orders){
            if(!"DELIVERED".equals(order.getStatus())) continue;
            if(order.getItems() == null) continue;
            for(OrderDetail item : order.getItems()){
                if(item.getProductId() != null && item.getProductId().intValue() == productId){
                    return true;
                }
            }
        }
        return false;
    }
}