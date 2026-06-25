package com.source.controller;

import com.source.model.Product;
import com.source.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts(
            // Nhận chuỗi "Mountain,Road" rồi tự split — tránh lỗi Spring không parse List từ chuỗi CSV
            @RequestParam(value = "categoryName", required = false) String categoryName,
            @RequestParam(value = "brand", required = false) String brand,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice) {

        // Split chuỗi "Mountain,Road" → ["Mountain", "Road"], trim khoảng trắng thừa
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

        List<Product> products = productService.getFilteredProducts(categories, brands, minPrice, maxPrice);
        return ResponseEntity.ok(products);
    }
}