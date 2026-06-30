package com.source.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    private Long orderId;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "promo_id")
    private Long promoId;

    @Column(name = "order_date")
    private LocalDateTime orderDate;

    @Column(name = "total_amount", precision = 15, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "shipping_address", length = 255)
    private String shippingAddress;

    @Column(name = "receiver_name", length = 100)
    private String receiverName;

    @Column(name = "receiver_phone", length = 20)
    private String receiverPhone;

    @Column(name = "status", length = 50)
    private String status;

    @Column(name = "note", length = 500)
    private String note;

    @PrePersist
    public void prePersist() {
        if (this.orderDate == null) this.orderDate = LocalDateTime.now();
        if (this.status == null) this.status = "PENDING";
    }

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<OrderDetail> items;

    // Field tạm, KHÔNG lưu DB (bảng orders không có cột này).
    // Frontend gửi paymentMethod trong cùng JSON body để Controller
    // đọc và tự tạo bản ghi Payment riêng (bảng payments).
    @Transient
    private String paymentMethod;

    @Transient
    private BigDecimal discount;

    // Getters & Setters
    public Long getOrderId()                    { return orderId; }
    public void setOrderId(Long orderId)        { this.orderId = orderId; }

    public Long getUserId()                     { return userId; }
    public void setUserId(Long userId)          { this.userId = userId; }

    public Long getPromoId()                    { return promoId; }
    public void setPromoId(Long promoId)        { this.promoId = promoId; }

    public LocalDateTime getOrderDate()         { return orderDate; }
    public void setOrderDate(LocalDateTime d)   { this.orderDate = d; }

    public BigDecimal getTotalAmount()          { return totalAmount; }
    public void setTotalAmount(BigDecimal a)    { this.totalAmount = a; }

    public String getShippingAddress()          { return shippingAddress; }
    public void setShippingAddress(String a)    { this.shippingAddress = a; }

    public String getReceiverName()             { return receiverName; }
    public void setReceiverName(String n)       { this.receiverName = n; }

    public String getReceiverPhone()            { return receiverPhone; }
    public void setReceiverPhone(String p)      { this.receiverPhone = p; }

    public String getStatus()                   { return status; }
    public void setStatus(String status)        { this.status = status; }

    public String getNote()                     { return note; }
    public void setNote(String note)            { this.note = note; }

    public List<OrderDetail> getItems()         { return items; }
    public void setItems(List<OrderDetail> i)   { this.items = i; }

    public String getPaymentMethod()            { return paymentMethod; }
    public void setPaymentMethod(String m)      { this.paymentMethod = m; }

    public BigDecimal getDiscount()             { return discount; }
    public void setDiscount(BigDecimal d)       { this.discount = d; }
}