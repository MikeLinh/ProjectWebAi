package com.source.repository;

import com.source.model.Warranty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface WarrantyRepository extends JpaRepository<Warranty, Integer> {
    List<Warranty> findAllByOrderByCreatedAtDesc();
    List<Warranty> findByStatus(String status);
    @Query("SELECT w FROM Warranty w " +
           "JOIN w.orderDetail od " +
           "JOIN od.order o " +
           "WHERE o.userId = :userId " +
           "ORDER BY w.createdAt DESC")
    List<Warranty> findByUserIdOrderByCreatedAtDesc(@Param("userId") Integer userId);
    Optional<Warranty> findByOrderDetail_OrderDetailId(Long orderDetailId);
    Long countByStatus(String status);
}