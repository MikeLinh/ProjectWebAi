package com.source.controller;

import com.source.model.Manufacturer;
import com.source.repository.ManufacturerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/manufacturers")
@CrossOrigin(origins = "http://localhost:5173")
public class ManufacturerController {

    @Autowired 
    private ManufacturerRepository manufacturerRepository;

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
    public ResponseEntity<Manufacturer> create(@RequestBody Manufacturer manufacturer) {
        Manufacturer saved = manufacturerRepository.save(manufacturer);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Manufacturer> update(@PathVariable Integer id, @RequestBody Manufacturer updated) {
        Optional<Manufacturer> opt = manufacturerRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Manufacturer existing = opt.get();
        existing.setManufacturerName(updated.getManufacturerName());
        existing.setCountry(updated.getCountry());
        existing.setActive(updated.getActive());
        
        return ResponseEntity.ok(manufacturerRepository.save(existing));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        if (!manufacturerRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        manufacturerRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}