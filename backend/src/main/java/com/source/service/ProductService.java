package com.source.service;

import com.source.model.Product;
import com.source.repository.ProductRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class ProductService {

    protected final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public List<Product> getFilteredProducts(
            List<String> categories,
            List<String> brands,
            BigDecimal minPrice,
            BigDecimal maxPrice) {

        // Specification: build query động tuỳ theo filter nào được truyền vào
        Specification<Product> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Lọc theo danh mục — chỉ thêm nếu có giá trị
            if (categories != null && !categories.isEmpty()) {
                predicates.add(root.get("category").get("categoryName").in(categories));
            }

            // Lọc theo thương hiệu — chỉ thêm nếu có giá trị
            if (brands != null && !brands.isEmpty()) {
                predicates.add(root.get("brand").in(brands));
            }

            // Lọc giá tối thiểu
            if (minPrice != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), minPrice));
            }

            // Lọc giá tối đa
            if (maxPrice != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), maxPrice));
            }

            // Kết hợp tất cả điều kiện bằng AND
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return productRepository.findAll(spec);
    }
}