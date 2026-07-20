package com.source.service;

import java.util.stream.Collectors;
import com.source.model.Product;
import com.source.repository.ProductRepository;
import com.source.repository.ProductReviewRepository;

import jakarta.persistence.criteria.Predicate;
import java.nio.file.StandardCopyOption;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import java.nio.file.Path;


@Service
public class ProductService {

    protected final ProductRepository productRepository;
    private final ProductReviewRepository productReviewRepository;
    
    //Khởi tạo các Repository thông qua Constructor
    public ProductService(ProductRepository productRepository, ProductReviewRepository productReviewRepository) {
        this.productRepository = productRepository;
        this.productReviewRepository = productReviewRepository;
    }
    private final String UPLOAD_DIR = "src/assets/images/"; // Thư mục lưu trữ hình ảnh tải lên 

    @Transactional
    public Product saveProduct(Product product, MultipartFile imageFile) {
        // Kiểm tra xem người dùng có tải lên file ảnh mới hay không
        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                String fileName = imageFile.getOriginalFilename();
                Path uploadPath = Paths.get(UPLOAD_DIR);
                // Nếu thư mục lưu trữ hình ảnh chưa tồn tại trên ổ đĩa, tiến hành tạo mới
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }

                Path filePath = uploadPath.resolve(fileName); // Xác định đường dẫn file cụ thể
                
                // Sao chép luồng dữ liệu (Input Stream) của file tải lên vào thư mục đích, ghi đè nếu file đã tồn tại
                try (var inputStream = imageFile.getInputStream()) {
                    Files.copy(inputStream, filePath, StandardCopyOption.REPLACE_EXISTING);
                }

                product.setImageUrl(fileName);
                System.out.println("Đã lưu ảnh thành công: " + fileName);
            } catch (IOException e) {
                throw new RuntimeException("Lỗi lưu file: " + e.getMessage(), e);
            }
        }
        // Thiết lập trạng thái mặc định cho thuộc tính IsNew nếu nó bị null
        if(product.getIsNew() == null){
            product.setIsNew(true);
        }
        // Thiết lập ngày giờ tạo mặc định nếu chưa được gán
        if(product.getCreatedAt() == null){
            product.setCreatedAt(LocalDateTime.now());
        }
        return productRepository.save(product);
    }

    @Transactional(readOnly = true)
    public List<Product> getFilteredProducts(
            List<String> categories,
            List<String> brands,
            BigDecimal minPrice,
            BigDecimal maxPrice) {

        //Chuyển đổi danh sách String (từ frontend) sang danh sách Integer (để khớp với categoryId)
        List<Integer> categoryIds = (categories == null || categories.isEmpty()) 
            ? null 
            : categories.stream().map(Integer::parseInt).collect(Collectors.toList());
        // Khởi tạo đối tượng Specification để xây dựng câu truy vấn SQL động
        Specification<Product> spec = (root, query, cb) -> { //CriteriaBuilder = cb, 
            List<Predicate> predicates = new ArrayList<>();

            if (categoryIds != null && !categoryIds.isEmpty()) {
                predicates.add(root.get("category").get("categoryId").in(categories));
            }
            if (brands != null && !brands.isEmpty()) {
                predicates.add(root.get("manufacturer").get("manufacturerName").in(brands));
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

    //Lấy toàn bộ danh sách sản phẩm đồng thời đếm số lượng đánh giá của từng sản phẩm
    @Transactional(readOnly = true)
    public List<Product> getAllProductsWithReviewCount() {
        List<Product> products = productRepository.findAll();
        for (Product p : products) {
            long count = productReviewRepository.countByProductId(p.getProductId());
            p.setReviewCount((int) count);
        }
        return products;
    }

    //Lấy danh sách sản phẩm lọc theo bộ tiêu chí đồng thời đếm số lượng đánh giá
    @Transactional(readOnly = true)
    public List<Product> getFilteredProductsWithReviewCount(
            List<String> categories,
            List<String> brands,
            BigDecimal minPrice,
            BigDecimal maxPrice) {
        //Gọi hàm lọc danh sách sản phẩm
        List<Product> products = getFilteredProducts(categories, brands, minPrice, maxPrice);
        
        for (Product p : products) {
            long count = productReviewRepository.countByProductId(p.getProductId());
            p.setReviewCount((int) count);
        }
        return products;
    }

    //Lấy danh sách sản phẩm cùng thương hiệu 
    @Transactional(readOnly = true)
    public List<Product> getProductsByBrandAndExcludeId(Integer manufacturerId, Integer excludeProductId) {
    Specification<Product> spec = (root, query, cb) -> {
        List<Predicate> predicates = new ArrayList<>();
            // Lọc các sản phẩm thuộc cùng một thương hiệu
            if(manufacturerId != null){
                predicates.add(cb.equal(root.get("manufacturer").get("manufacturerId"), manufacturerId));
            }
            // Loại trừ sản phẩm đang xem chi tiết ra khỏi danh sách gợi ý liên quan
            if (excludeProductId != null) {
                predicates.add(cb.notEqual(root.get("productId"), excludeProductId));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
    };

        return productRepository.findAll(spec);
    }

    //Lấy danh sách sản phẩm liên quan theo thương hiệu kèm theo đếm số lượng đánh giá
    @Transactional(readOnly = true)
    public List<Product> getProductsByBrandAndExcludeIdWithReviewCount(Integer manufacturerId, Integer excludeProductId) {
        List<Product> products = getProductsByBrandAndExcludeId(manufacturerId, excludeProductId);
        for (Product p : products) {
            long count = productReviewRepository.countByProductId(p.getProductId());
            p.setReviewCount((int) count);
        }
        return products;
    }
    //Lấy danh sách toàn bộ các sản phẩm đang có chương trình giảm giá
    @Transactional(readOnly = true)
    public List<Product> getProductsWithDiscount() {
        Specification<Product> spec = (root, query, cb) ->  //root đại diện cho Entity, cb công cụ xây dựng các đk so sánh
            cb.greaterThan(root.get("discountPercent"), 0);
        List<Product> products = productRepository.findAll(spec);
        for (Product p : products) {
            long count = productReviewRepository.countByProductId(p.getProductId());
            p.setReviewCount((int) count);
        }
        return products;
    }
    @Transactional
    public void decreaseStockForOrder(Long productId, int quantity) {
        // Thực thi hàm trừ kho tự động trong Repository, trả về số lượng dòng dữ liệu bị ảnh hưởng
        int updatedRows = productRepository.decreaseStock(productId, quantity);
        // Nếu không có dòng nào bị ảnh hưởng, đồng nghĩa kho thực tế không đủ đáp ứng
        if (updatedRows == 0) {
            Product product = productRepository.findById(productId).orElse(null);
            String name = product != null ? product.getProductName() : "ID " + productId;
            throw new IllegalStateException("Sản phẩm \"" + name + "\" không đủ số lượng trong kho");
        }
    }
    @Transactional
    public void restoreStock(Long productId, int quantity) {
        // Tìm sản phẩm trong DB, nếu thấy thì cộng trả lại số lượng tương ứng
        productRepository.findById(productId).ifPresent(p -> {
            p.setStockQuantity(p.getStockQuantity() + quantity); // Cộng trả số lượng
            productRepository.save(p); //Lưu db
        });
    }
            
}