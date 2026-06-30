package com.source.repository;

import com.source.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    // Lấy tất cả đơn, mới nhất trước
    List<Order> findAllByOrderByOrderDateDesc();

    // Lấy đơn theo user
    List<Order> findByUserIdOrderByOrderDateDesc(Long userId);

    // Lấy đơn theo trạng thái
    List<Order> findByStatusOrderByOrderDateDesc(String status);

    // Tổng doanh thu theo trạng thái DELIVERED
    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.status = 'DELIVERED'")
    java.math.BigDecimal sumDeliveredRevenue();
}