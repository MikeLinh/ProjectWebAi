    package com.source.controller;

import com.source.model.Category;
import com.source.model.Manufacturer;
import com.source.model.Product;
import com.source.repository.ProductRepository;
import com.source.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController 
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductController {
    //Định nghĩa lưu trữ ảnh khi người dùng upload
    private final String UPLOAD_DIR = "src/assets/images/";
    
    @Autowired
    private ProductService productService;
    @Autowired
    private ProductRepository productRepository;
    

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts(
            @RequestParam(value = "categoryName", required = false) String categoryName,
            @RequestParam(value = "brand", required = false) String brand,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice) {
        // Nếu tham số danh mục truyền lên không rỗng, tiến hành tách chuỗi bằng dấu phẩy và dọn khoảng trắng
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
        // Gọi tầng Service để thực hiện tìm kiếm, lọc dữ liệu và tính toán số lượng đánh giá
        List<Product> products = productService.getFilteredProductsWithReviewCount(categories, brands, minPrice, maxPrice);
        return ResponseEntity.ok(products);
    }
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Integer id) {
        Optional<Product> opt = productRepository.findById(id.longValue());
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(opt.get());
    }
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE) //Nhận cả định dạng các dạng như file và file ảnh
    public ResponseEntity<Product> createProduct(
            @RequestParam("productName") String productName,
            @RequestParam("manufacturerName") String manufacturerName,
            @RequestParam("manufacturerId") Integer manufacturerId,
            @RequestParam("price") BigDecimal price,
            @RequestParam("stockQuantity") Integer stockQuantity,
            @RequestParam("categoryId") Integer categoryId,
            @RequestParam("description") String description,
            @RequestParam("discountPercent") Integer discountPercent,
            @RequestParam(value = "image", required = false) MultipartFile image) { // File ảnh tải lên (không bắt buộc)

        try {
            Product product = new Product();
            product.setProductName(productName);
            product.setPrice(price);
            product.setStockQuantity(stockQuantity);
            product.setDescription(description);
            product.setDiscountPercent(discountPercent);
            product.setIsNew(true);

            // Liên kết danh mục cho sản phẩm thông qua Category ID
            Category category = new Category();
            category.setCategoryId(categoryId);
            product.setCategory(category);
            
            Manufacturer manufacturer = new Manufacturer();
            manufacturer.setManufacturerId(manufacturerId); 
            product.setManufacturer(manufacturer);

            Product saved = productService.saveProduct(product, image);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
   @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Product> updateProduct(
            @PathVariable Integer id,
            @RequestParam("productName") String productName,
            @RequestParam("manufacturerName") String manufacturerName,
            @RequestParam("manufacturerId") Integer manufacturerId,
            @RequestParam("price") BigDecimal price,
            @RequestParam("stockQuantity") Integer stockQuantity,
            @RequestParam("categoryId") Integer categoryId,
            @RequestParam("description") String description,
            @RequestParam("discountPercent") Integer discountPercent,
            @RequestParam(value = "image", required = false) MultipartFile image) {

        try {
            Optional<Product> opt = productRepository.findById(id.longValue());
            if (opt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            Product product = opt.get(); 
            
            product.setProductName(productName);
            product.setPrice(price);
            product.setStockQuantity(stockQuantity);
            product.setDescription(description);
            product.setDiscountPercent(discountPercent);
            product.setIsNew(false); 

          
            Category category = new Category();
            category.setCategoryId(categoryId);
            product.setCategory(category);

            Manufacturer manufacturer = new Manufacturer();
            manufacturer.setManufacturerId(manufacturerId); 
            product.setManufacturer(manufacturer); 

            Product saved = productService.saveProduct(product, image);
            return ResponseEntity.ok(saved);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Integer id) {
        productService.deleteProduct(id);
        
        return ResponseEntity.noContent().build();
    }

    //Lấy danh sách sản phẩm liên quan theo cùng thương hiệu
    @GetMapping("/related-by-brand")
    public ResponseEntity<List<Product>> getRelatedByBrand(
            @RequestParam Integer brand,
            @RequestParam(required = false) Integer excludeId) {    
        
        List<Product> products = productService.getProductsByBrandAndExcludeIdWithReviewCount(brand, excludeId);
        return ResponseEntity.ok(products);
    }
    //Cập nhật nhanh số lượng tồn kho
    @PatchMapping("/{id}/stock")
    public ResponseEntity<Product> updateStock(@PathVariable Integer id, @RequestBody Map<String, Integer> request){
        Integer newStock= request.get("stockQuantity"); // Lấy giá trị tồn kho mới từ Map
        if(newStock == null){
            return ResponseEntity.badRequest().build();
        }
        // Tìm sản phẩm cần cập nhật trong DB
        Optional<Product> opt = productRepository.findById(id.longValue());
        if(opt.isEmpty()){
            return ResponseEntity.notFound().build();
        }
        Product product= opt.get();
        product.setStockQuantity(newStock); //cập nhập số lượng tồn kho mới
        Product saved = productRepository.save(product); //Lưu sp vào db
        return ResponseEntity.ok(saved);
    }
    @GetMapping("/search")
    public ResponseEntity<List<Product>> searchByName(@RequestParam  String name) {
        if(name == null || name.trim().isEmpty()){
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(productRepository.findByProductNameContainingIgnoreCase(name));
    }

    @GetMapping("/count")
    public ResponseEntity<Long> countProducts(){
        return ResponseEntity.ok(productRepository.count());
    }
    

}