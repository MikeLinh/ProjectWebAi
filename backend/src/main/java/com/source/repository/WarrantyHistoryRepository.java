package com.source.repository;

import com.source.model.WarrantyHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WarrantyHistoryRepository extends JpaRepository<WarrantyHistory, Long> {
    List<WarrantyHistory> findByWarranty_WarrantyId(Integer warrantyId); // Lấy lịch sử bảo hành theo ID thẻ bảo hành
}