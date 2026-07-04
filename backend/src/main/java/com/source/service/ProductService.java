package com.source.service;

import com.source.model.Product;
import com.source.repository.ProductRepository;
import com.source.repository.ProductReviewRepository;

import jakarta.persistence.criteria.Predicate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

import java.nio.file.Path;


@Service
public class ProductService {

    protected final ProductRepository productRepository;
    private final ProductReviewRepository productReviewRepository;

    public ProductService(ProductRepository productRepository, ProductReviewRepository productReviewRepository) {
        this.productRepository = productRepository;
        this.productReviewRepository = productReviewRepository;
    }
    private final String UPLOAD_DIR = "src/assets/images/";

    @Transactional
    public Product saveProduct(Product product, MultipartFile imageFile) {
        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                String fileName = imageFile.getOriginalFilename();
                Path uploadPath = Paths.get(UPLOAD_DIR);
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }

                Path filePath = uploadPath.resolve(fileName);
                
                if (Files.exists(filePath)) {
                    Files.delete(filePath);
                }

                Files.copy(imageFile.getInputStream(), filePath);

                product.setImageUrl(fileName);
                System.out.println("Đã lưu ảnh: " + fileName);
            } catch (IOException e) {
                throw new RuntimeException("Lỗi lưu file: " + e.getMessage());
            }
        }
        return productRepository.save(product);
    }

    @Transactional(readOnly = true)
    public List<Product> getFilteredProducts(
            List<String> categories,
            List<String> brands,
            BigDecimal minPrice,
            BigDecimal maxPrice) {

        Specification<Product> spec = (root, query, cb) -> { //CriteriaBuilder = cb, 
            List<Predicate> predicates = new ArrayList<>();

            if (categories != null && !categories.isEmpty()) {
                predicates.add(root.get("category").get("categoryName").in(categories));
            }
            if (brands != null && !brands.isEmpty()) {
                predicates.add(root.get("brand").in(brands));
            }
            if (minPrice != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), minPrice));
            }
            if (maxPrice != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), maxPrice));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return productRepository.findAll(spec);
    }

    @Transactional
    public Product saveProduct(Product product) {
        return productRepository.save(product);
    }

    @Transactional
    public void deleteProduct(Integer id) {
        productRepository.deleteById(id.longValue());
    }
    @Transactional(readOnly = true)
    public List<Product> getAllProductsWithReviewCount() {
        List<Product> products = productRepository.findAll();
        for (Product p : products) {
            long count = productReviewRepository.countByProductId(p.getProductId());
            p.setReviewCount((int) count);
        }
        return products;
    }
    @Transactional(readOnly = true)
    public List<Product> getFilteredProductsWithReviewCount(
            List<String> categories,
            List<String> brands,
            BigDecimal minPrice,
            BigDecimal maxPrice) {
        
        List<Product> products = getFilteredProducts(categories, brands, minPrice, maxPrice);
        
        for (Product p : products) {
            long count = productReviewRepository.countByProductId(p.getProductId());
            p.setReviewCount((int) count);
        }
        return products;
    }
    @Transactional(readOnly = true)
    public List<Product> getProductsByBrandAndExcludeId(String brand, Long excludeProductId) {
    Specification<Product> spec = (root, query, cb) -> {
        List<Predicate> predicates = new ArrayList<>();

            if (brand != null && !brand.isBlank()) {
                predicates.add(cb.equal(root.get("brand"), brand));
            }
            if (excludeProductId != null) {
                predicates.add(cb.notEqual(root.get("productId"), excludeProductId));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
    };

        return productRepository.findAll(spec);
    }

    @Transactional(readOnly = true)
    public List<Product> getProductsByBrandAndExcludeIdWithReviewCount(String brand, Long excludeProductId) {
        List<Product> products = getProductsByBrandAndExcludeId(brand, excludeProductId);
        for (Product p : products) {
            long count = productReviewRepository.countByProductId(p.getProductId());
            p.setReviewCount((int) count);
        }
        return products;
    }
    @Transactional(readOnly = true)
    public List<Product> getProductsWithDiscount() {
        Specification<Product> spec = (root, query, cb) -> 
            cb.greaterThan(root.get("discountPercent"), 0);
        List<Product> products = productRepository.findAll(spec);
        for (Product p : products) {
            long count = productReviewRepository.countByProductId(p.getProductId());
            p.setReviewCount((int) count);
        }
        return products;
    }
        
}