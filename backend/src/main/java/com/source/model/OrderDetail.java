package com.source.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "order_details")
public class OrderDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_detail_id")
    private Long orderDetailId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @JsonIgnore
    private Order order;

    @Column(name = "product_id")
    private Long productId;

    @Column(name = "product_name", length = 150)
    private String productName;

    @Column(name = "quantity")
    private Integer quantity;

    @Column(name = "price", precision = 15, scale = 2)
    private BigDecimal price;

    public Long getOrderDetailId()              { return orderDetailId; }
    public void setOrderDetailId(Long id)       { this.orderDetailId = id; }

    public Order getOrder()                     { return order; }
    public void setOrder(Order order)           { this.order = order; }

    public Long getProductId()                  { return productId; }
    public void setProductId(Long productId)    { this.productId = productId; }

    public String getProductName()              { return productName; }
    public void setProductName(String name)     { this.productName = name; }

    public Integer getQuantity()                { return quantity; }
    public void setQuantity(Integer quantity)   { this.quantity = quantity; }

    public BigDecimal getPrice()                { return price; }
    public void setPrice(BigDecimal price)      { this.price = price; }
}