package com.source.model;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.math.BigDecimal;

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

    public Integer getReviewCount() {
        return reviewCount != null ? reviewCount : 0;
    }

    public void setReviewCount(Integer reviewCount) {
        this.reviewCount = reviewCount != null ? reviewCount : 0;
    }
}