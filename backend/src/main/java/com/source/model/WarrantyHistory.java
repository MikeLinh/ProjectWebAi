package com.source.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "warranty_histories")
public class WarrantyHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "history_id")
    private Long historyId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "warranty_id", nullable = false)
    private Warranty warranty;

    // Ngày tiếp nhận máy để sửa chữa/bảo hành
    @Column(name = "received_date")
    private LocalDateTime receivedDate;

    // Ngày trả máy lại cho khách (null nếu chưa hoàn tất)
    @Column(name = "returned_date")
    private LocalDateTime returnedDate;

    // Mô tả lỗi/sự cố khách phản ánh
    @Column(name = "problem", length = 255)
    private String problem;

    // Cách xử lý / kết luận của kỹ thuật viên
    @Column(name = "solution", length = 255)
    private String solution;

    // Kỹ thuật viên phụ trách
    @Column(name = "technician", length = 255)
    private String technician;

    // Chi phí sửa chữa (nếu có phát sinh ngoài phạm vi bảo hành)
    @Column(name = "repair_cost", precision = 38, scale = 2)
    private BigDecimal repairCost;

    // Trạng thái xử lý của lần sửa chữa này: RECEIVED, REPAIRING, COMPLETED, RETURNED
    @Column(name = "status", length = 255)
    private String status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) this.createdAt = LocalDateTime.now();
        if (this.receivedDate == null) this.receivedDate = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getHistoryId() { return historyId; }
    public void setHistoryId(Long historyId) { this.historyId = historyId; }

    public Warranty getWarranty() { return warranty; }
    public void setWarranty(Warranty warranty) { this.warranty = warranty; }

    public LocalDateTime getReceivedDate() { return receivedDate; }
    public void setReceivedDate(LocalDateTime receivedDate) { this.receivedDate = receivedDate; }

    public LocalDateTime getReturnedDate() { return returnedDate; }
    public void setReturnedDate(LocalDateTime returnedDate) { this.returnedDate = returnedDate; }

    public String getProblem() { return problem; }
    public void setProblem(String problem) { this.problem = problem; }

    public String getSolution() { return solution; }
    public void setSolution(String solution) { this.solution = solution; }

    public String getTechnician() { return technician; }
    public void setTechnician(String technician) { this.technician = technician; }

    public BigDecimal getRepairCost() { return repairCost; }
    public void setRepairCost(BigDecimal repairCost) { this.repairCost = repairCost; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}