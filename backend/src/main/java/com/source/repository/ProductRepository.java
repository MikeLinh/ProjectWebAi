package com.source.repository;

import com.source.model.Product;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>,
        JpaSpecificationExecutor<Product> {
    List<Product> findByStockQuantityLessThanEqualOrderByStockQuantityAsc(int threshold);
     @Modifying
    @Query("UPDATE Product p SET p.stockQuantity = p.stockQuantity - :qty " +
           "WHERE p.productId = :id AND p.stockQuantity >= :qty")
    int decreaseStock(@Param("id") Long id, @Param("qty") int qty);

    boolean existsByCategory_CategoryId(Integer categoryId);
    boolean existsByManufacturer_ManufacturerId(Integer manufacturerId);
    boolean existsBySupplier_SupplierId(Integer supplierId);
}