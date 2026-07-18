package com.source.repository;

import com.source.model.Warranty;
import com.source.model.WarrantyHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WarrantyHistoryRepository extends JpaRepository<WarrantyHistory, Long> {
    // Lấy lịch sử bảo hành theo ID thẻ bảo hành, mới nhất lên trước
    List<WarrantyHistory> findByWarranty_WarrantyIdOrderByReceivedDateDesc(Integer warrantyId);

}