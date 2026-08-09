package com.source.controller;

import com.source.model.Category;
import com.source.repository.CategoryRepository;
import com.source.repository.ProductRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

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
    public ResponseEntity<Object> createCategory(@PathVariable Integer id,@RequestBody Category category) {
        //KT ID
        Optional<Category> categoryOpt = categoryRepository.findById(id);
        if(categoryOpt.isEmpty()){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy danh mục");
        }
        //KT Tên DM
        if(category.getCategoryName() == null || category.getCategoryName().trim().isEmpty()){
            return ResponseEntity.badRequest().body("Tên danh mục không được để trống !");
        }
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
    @GetMapping("/{id}")
    public ResponseEntity<?> categoryFindId(@PathVariable Integer id){
        Optional<Category> opt = categoryRepository.findById(id);
        if(opt.isEmpty()){
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(opt.get());
    } 
    @GetMapping("/count")
    public ResponseEntity<Long> countCategories(){
        return ResponseEntity.ok(categoryRepository.count());
    }
    @GetMapping("/{id}/product-count")
    public ResponseEntity<Long> countProductsInCategory(@PathVariable Integer id){
        return ResponseEntity.ok(productRepository.countByCategory_CategoryId(id));
    }
}