package com.source.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.source.model.WarehouseReceipt;

public interface WarehouseReceiptRepository extends JpaRepository<WarehouseReceipt, Long> {
    List<WarehouseReceipt> findAllByOrderByImportedAtDesc();
    List<WarehouseReceipt> findByProductIdOrderByImportedAtDesc(Long productId);
}
 