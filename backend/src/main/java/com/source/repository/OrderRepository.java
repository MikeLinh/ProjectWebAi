package com.source.repository;

import com.source.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findAllByOrderByOrderDateDesc();
    List<Order> findByUserIdOrderByOrderDateDesc(Long userId);
    List<Order> findByStatusOrderByOrderDateDesc(String status);
    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.status = 'DELIVERED'")
    java.math.BigDecimal sumDeliveredRevenue();
}