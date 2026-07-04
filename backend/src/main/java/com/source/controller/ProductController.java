package com.source.controller;

import com.source.model.Category;
import com.source.model.Product;
import com.source.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@RestController 
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductController {
    private final String UPLOAD_DIR = "src/assets/images/";
    
    @Autowired
    private ProductService productService;
    

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts(
            @RequestParam(value = "categoryName", required = false) String categoryName,
            @RequestParam(value = "brand", required = false) String brand,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice) {

        List<String> categories = null;
        if (categoryName != null && !categoryName.isBlank()) {
            categories = Arrays.stream(categoryName.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .toList();
        }

        List<String> brands = null;
        if (brand != null && !brand.isBlank()) {
            brands = Arrays.stream(brand.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .toList();
        }

        List<Product> products = productService.getFilteredProductsWithReviewCount(categories, brands, minPrice, maxPrice);
        return ResponseEntity.ok(products);
    }
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Product> createProduct(
            @RequestParam("productName") String productName,
            @RequestParam("brand") String brand,
            @RequestParam("price") BigDecimal price,
            @RequestParam("stockQuantity") Integer stockQuantity,
            @RequestParam("categoryId") Integer categoryId,
            @RequestParam("description") String description,
            @RequestParam("discountPercent") Integer discountPercent,
            @RequestParam(value = "image", required = false) MultipartFile image) {

        Product product = new Product();
        product.setProductName(productName);
        product.setBrand(brand);
        product.setPrice(price);
        product.setStockQuantity(stockQuantity);
        product.setDescription(description);
        product.setDiscountPercent(discountPercent);

        Category category = new Category();
        category.setCategoryId(categoryId);
        product.setCategory(category);

        Product saved = productService.saveProduct(product, image);
        return ResponseEntity.ok(saved);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Product> updateProduct(
            @PathVariable Integer id,
            @RequestParam("productName") String productName,
            @RequestParam("brand") String brand,
            @RequestParam("price") BigDecimal price,
            @RequestParam("stockQuantity") Integer stockQuantity,
            @RequestParam("categoryId") Integer categoryId,
            @RequestParam("description") String description,
            @RequestParam("discountPercent") Integer discountPercent,
            @RequestParam(value = "image", required = false) MultipartFile image) {

        Product product = new Product();
        product.setProductId(id);
        product.setProductName(productName);
        product.setBrand(brand);
        product.setPrice(price);
        product.setStockQuantity(stockQuantity);
        product.setDescription(description);
        product.setDiscountPercent(discountPercent);

        com.source.model.Category category = new com.source.model.Category();
        category.setCategoryId(categoryId);
        product.setCategory(category);

        if (image != null && !image.isEmpty()) {
            String fileName = image.getOriginalFilename();
            product.setImageUrl(fileName);
        }

        Product saved = productService.saveProduct(product);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Integer id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/related-by-brand")
    public ResponseEntity<List<Product>> getRelatedByBrand(
            @RequestParam String brand,
            @RequestParam(required = false) Long excludeId) {
        
        List<Product> products = productService.getProductsByBrandAndExcludeIdWithReviewCount(brand, excludeId);
        return ResponseEntity.ok(products);
    }
    
}