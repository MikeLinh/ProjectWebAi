package com.source.controller;

import com.source.model.Category;
import com.source.repository.CategoryRepository;
import com.source.repository.ProductRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "http://localhost:5173")
public class CategoryController {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<Category> createCategory(@RequestBody Category category) {
        Category saved = categoryRepository.save(category);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Category> updateCategory(@PathVariable Integer id, @RequestBody Category category) {
        category.setCategoryId(id);
        Category saved = categoryRepository.save(category);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Integer id) {
        if(!categoryRepository.existsById(id)){
            return ResponseEntity.notFound().build();
        }
        if (productRepository.existsByCategory_CategoryId(id)) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body("Không thể xóa danh mục này vì đang có sản phẩm tồn tại!");
    }
        categoryRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}