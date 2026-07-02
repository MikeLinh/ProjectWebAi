package com.source.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_id")
    private Long paymentId;

    @Column(name = "order_id")
    private Long orderId;

    @Column(name = "payment_method", length = 50)
    private String paymentMethod;

    @Column(name = "transaction_id", length = 100)
    private String transactionId;

    @Column(name = "amount", precision = 15, scale = 2)
    private BigDecimal amount;

    // PENDING | PAID | FAILED
    @Column(name = "payment_status", length = 50)
    private String paymentStatus;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    public Long getPaymentId()                      { return paymentId; }
    public void setPaymentId(Long paymentId)        { this.paymentId = paymentId; }

    public Long getOrderId()                        { return orderId; }
    public void setOrderId(Long orderId)            { this.orderId = orderId; }

    public String getPaymentMethod()                { return paymentMethod; }
    public void setPaymentMethod(String m)          { this.paymentMethod = m; }

    public String getTransactionId()                { return transactionId; }
    public void setTransactionId(String t)          { this.transactionId = t; }

    public BigDecimal getAmount()                   { return amount; }
    public void setAmount(BigDecimal amount)        { this.amount = amount; }

    public String getPaymentStatus()                { return paymentStatus; }
    public void setPaymentStatus(String s)          { this.paymentStatus = s; }

    public LocalDateTime getPaidAt()                { return paidAt; }
    public void setPaidAt(LocalDateTime paidAt)     { this.paidAt = paidAt; }
}