package com.source.controller;

import com.source.model.Manufacturer;
import com.source.repository.ManufacturerRepository;
import com.source.repository.ProductRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/manufacturers")
public class ManufacturerController {

    @Autowired 
    private ManufacturerRepository manufacturerRepository;

    @Autowired
    private ProductRepository productRepository;

    @GetMapping
    public ResponseEntity<List<Manufacturer>> getAll() {
        return ResponseEntity.ok(manufacturerRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Manufacturer> getById(@PathVariable Integer id) {
        return manufacturerRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Manufacturer manufacturer) {
        if(manufacturer.getManufacturerName() == null || manufacturer.getManufacturerName().trim().isEmpty()){
            return ResponseEntity.badRequest().body("Tên nsx không được để trống");
        }
        Manufacturer saved = manufacturerRepository.save(manufacturer);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Integer id, @RequestBody Manufacturer updated) {
        Optional<Manufacturer> opt = manufacturerRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        if(updated.getManufacturerName() == null || updated.getManufacturerName().trim().isEmpty()){
                return ResponseEntity.badRequest().body("Tên nsx không được để trống");
        }

        Manufacturer existing = opt.get();
    
        existing.setManufacturerName(updated.getManufacturerName());
        existing.setCountry(updated.getCountry());
        existing.setActive(updated.getActive());
        
        return ResponseEntity.ok(manufacturerRepository.save(existing));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        if(id == null || id <= 0 ){
            return ResponseEntity.badRequest().body("ID không hợp lệ");
        }
        if(!manufacturerRepository.existsById(id)){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Nhà sản xuất không hợp lệ");
        }
        if (!manufacturerRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        if(productRepository.existsByManufacturer_ManufacturerId(id)){
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body("Không thể xóa nhà sản xuất này vì đang có sản phẩm tồn tại!");
        }
        manufacturerRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}