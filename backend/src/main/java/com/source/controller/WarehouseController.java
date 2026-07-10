package com.source.controller;

import com.source.model.Product;
import com.source.model.Category;
import com.source.model.WarehouseReceipt;
import com.source.repository.ProductRepository;
import com.source.repository.WarehouseReceiptRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;


@RestController
@RequestMapping("/api/warehouse")
@CrossOrigin(origins = "http://localhost:5173")
public class WarehouseController {

    @Autowired private WarehouseReceiptRepository warehouseReceiptRepository;
    @Autowired private ProductRepository productRepository;

    private static final int LOW_STOCK_THRESHOLD = 5;
    @GetMapping
    public ResponseEntity<List<WarehouseReceipt>> getAll() {
        return ResponseEntity.ok(
                warehouseReceiptRepository.findAllByOrderByImportedAtDesc()
        );
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<Product>> getLowStock() {
        return ResponseEntity.ok(
                productRepository.findByStockQuantityLessThanEqualOrderByStockQuantityAsc(
                        LOW_STOCK_THRESHOLD
                )
        );
    }

    @PostMapping
    public ResponseEntity<?> importStock(@RequestBody WarehouseReceipt receipt) {
        Optional<Product> opt = productRepository.findById(receipt.getProductId());
        Product product;
        if (opt.isEmpty()) {
            product = new Product();
            product.setProductName("Sản phẩm " + receipt.getProductId());
            product.setBrand(receipt.getManufacturer());
            product.setPrice(BigDecimal.valueOf(0));
            product.setStockQuantity(0);
            product.setIsNew(true);

            Category defaultCategory = new Category();
            product.setCategory(defaultCategory);

            product = productRepository.save(product);
            receipt.setProductId(product.getProductId().longValue());
        }else{
            product = opt.get();
        }
        product.setStockQuantity(product.getStockQuantity() + receipt.getQuantityAdded());
        productRepository.save(product);
        receipt.setImportedAt(LocalDateTime.now());
        WarehouseReceipt saved = warehouseReceiptRepository.save(receipt);

        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateReceipt(@PathVariable Long id, @RequestBody WarehouseReceipt updatedReceipt) {
        Optional<WarehouseReceipt> receiptOpt = warehouseReceiptRepository.findById(id);
        if (receiptOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        WarehouseReceipt existingReceipt = receiptOpt.get();
        Optional<Product> productOpt = productRepository.findById(existingReceipt.getProductId());
        
        if (productOpt.isPresent()) {
            Product product = productOpt.get();
            int diffQuantity = updatedReceipt.getQuantityAdded() - existingReceipt.getQuantityAdded();
            product.setStockQuantity(product.getStockQuantity() + diffQuantity);
            productRepository.save(product);
        }
        existingReceipt.setQuantityAdded(updatedReceipt.getQuantityAdded());
        existingReceipt.setImportPrice(updatedReceipt.getImportPrice());
        existingReceipt.setSupplier(updatedReceipt.getSupplier());
        existingReceipt.setManufacturer(updatedReceipt.getManufacturer());
        existingReceipt.setImportedAt(LocalDateTime.now()); 

        WarehouseReceipt saved = warehouseReceiptRepository.save(existingReceipt);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReceipt(@PathVariable Long id) {
        if (!warehouseReceiptRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        warehouseReceiptRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
    @GetMapping("/available")
    public ResponseEntity<List<Product>> getAvailableForProduct() {
        return ResponseEntity.ok(productRepository.findAll());
    }
}