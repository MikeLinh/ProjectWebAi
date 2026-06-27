package com.source.controller;

import com.source.model.User;
import com.source.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173") 
public class AuthController {

    @Autowired
    private UserRepository userRepository;
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginData) {
        Optional<User> userOpt = userRepository.findByEmailAndPassword(
            loginData.getEmail(), 
            loginData.getPassword()
        );
        
        if (userOpt.isPresent()) {
            User foundUser = userOpt.get();
            foundUser.setPassword(null); 
            return ResponseEntity.ok(foundUser);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Sai email hoặc mật khẩu!");
        }
    }
    
    @PutMapping("/update-profile/{id}")
    public ResponseEntity<?> updateProfile(@PathVariable Long id, @RequestBody User updatedData) {
 
        Optional<User> userOpt = userRepository.findById(id);
        
        if (userOpt.isPresent()) {
            User existingUser = userOpt.get();
            
            existingUser.setFullName(updatedData.getFullName());
            existingUser.setPhoneNumber(updatedData.getPhoneNumber());
            existingUser.setAddress(updatedData.getAddress());
            User savedUser = userRepository.save(existingUser);
            savedUser.setPassword(null); 
            
            return ResponseEntity.ok(savedUser);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy người dùng này!");
        }
    }
}