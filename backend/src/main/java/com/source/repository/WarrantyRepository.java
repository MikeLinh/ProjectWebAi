package com.source.repository;

import com.source.model.Warranty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WarrantyRepository extends JpaRepository<Warranty, Integer> {
    List<Warranty> findAllByOrderByCreatedAtDesc();
    List<Warranty> findByStatus(String status);
}