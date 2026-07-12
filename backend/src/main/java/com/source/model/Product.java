package com.source.model;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import jakarta.persistence.PrePersist;

@Entity
@Table(name = "PRODUCTS")
@Data
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_id")
    private Integer productId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", referencedColumnName = "category_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"}) 
    private Category category;

    @Column(name = "product_name", nullable = false, length = 150)
    private String productName;

    @Column(name = "brand", length = 100)
    private String brand;

    @Column(name = "price", nullable = false, precision = 15, scale = 2)
    private BigDecimal price;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "stock_quantity")
    private Integer stockQuantity;
    @Transient  
    private Integer reviewCount = 0;

    @Column(name = "discount_percent")
    private Integer discountPercent = 0;

    @Column(name = "is_new", nullable = false)
    private Boolean isNew = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public LocalDateTime getCratedAt(){
        return createdAt;
    }
    public void setCreatedAt(LocalDateTime createdAt){
        this.createdAt = createdAt;
    }

    public Boolean getIsNew(){
        if(this.createdAt == null){
            return this.isNew != null ? this.isNew : false;
        }
        java.time.LocalDateTime sixMonthAgo = java.time.LocalDateTime.now().minusMonths(6);
        return this.createdAt.isAfter(sixMonthAgo);
    }
    public void setIsNew(Boolean isNew){
        this.isNew = isNew != null ? isNew : false;
    }

    public Integer getReviewCount() {
        return reviewCount != null ? reviewCount : 0;
    }

    public void setReviewCount(Integer reviewCount) {
        this.reviewCount = reviewCount != null ? reviewCount : 0;
    }
    public Integer getDiscountPercent() {
    return discountPercent != null ? discountPercent : 0;
    }

    public void setDiscountPercent(Integer discountPercent) {
        this.discountPercent = discountPercent != null ? discountPercent : 0;
    }

    @PrePersist
    protected void onCreate(){
        this.createdAt = LocalDateTime.now();
        this.isNew = true;
    }
}