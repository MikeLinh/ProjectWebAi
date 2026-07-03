package com.source.controller;

import com.source.model.User;
import com.source.repository.UserRepository;
import com.source.service.EmailService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email đã tồn tại!");
        }

        if (user.getFullName() == null || user.getFullName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Họ tên không được để trống!");
        }

        if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Mật khẩu không được để trống!");
        }

        if (user.getRole() == null || user.getRole().isBlank()) {
            user.setRole("USER");
        }

        User savedUser = userRepository.save(user);
        savedUser.setPassword(null); 

        return ResponseEntity.ok(savedUser);
    }
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginData) {
        Optional<User> userOpt = userRepository.findByEmailAndPassword(
            loginData.getEmail(), 
            loginData.getPassword()
        );
        
        if (userOpt.isPresent()) {
            User foundUser = userOpt.get();
            foundUser.setPassword(null);

            String token = java.util.Base64.getEncoder()
                .encodeToString((foundUser.getEmail() + "|" + System.currentTimeMillis()).getBytes());

            LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(10);

            Map<String, Object> response = new HashMap<>();
            response.put("user", foundUser);
            response.put("token", token);
            response.put("expiresAt", expiresAt.toString());

            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Sai email hoặc mật khẩu!");
        }
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestHeader("Authorization") String authorizationHeader) {
        try {
            String accessToken = authorizationHeader.replace("Bearer ", "").trim();

            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + accessToken);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            String googleUrl = "https://www.googleapis.com/oauth2/v3/userinfo";
            ResponseEntity<Map> googleResponse = restTemplate.exchange(googleUrl, HttpMethod.GET, entity, Map.class);

            Map<String, Object> googleData = googleResponse.getBody();
            if (googleData == null || !googleData.containsKey("email")) {
                return ResponseEntity.badRequest().body("Không thể lấy thông tin từ Google");
            }

            String email = (String) googleData.get("email");
            String fullName = (String) googleData.get("name");
            Optional<User> existingUser = userRepository.findByEmail(email);

            User user;
            if (existingUser.isPresent()) {
                user = existingUser.get();
            } else {
                // Tạo user mới từ Google
                user = new User();
                user.setEmail(email);
                user.setFullName(fullName);
                user.setPassword("");         
                user.setRole("USER");
                user.setPhoneNumber("");
                user.setAddress("");
                user = userRepository.save(user);
            }

    
            String token = java.util.Base64.getEncoder()
                    .encodeToString((user.getEmail() + "|" + System.currentTimeMillis()).getBytes());

            LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(10);

            Map<String, Object> response = new HashMap<>();
            response.put("user", user);
            response.put("token", token);
            response.put("expiresAt", expiresAt.toString());
            response.put("message", "Đăng nhập Google thành công");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Đăng nhập Google thất bại: " + e.getMessage());
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
            if(updatedData.getPassword() != null && !updatedData.getPassword().trim().isEmpty()) {
                existingUser.setPassword(updatedData.getPassword().trim());
            }
            
            User savedUser = userRepository.save(existingUser);
            savedUser.setPassword(null); 
            
            return ResponseEntity.ok(savedUser);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Không tìm thấy người dùng này!");
        }
    }
        
    @Autowired
    private EmailService emailService;
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Email không tồn tại trong hệ thống!");
        }
        User user = userOpt.get();
        String newPassword = generateRandomPassword(8);
        user.setPassword(newPassword);
        userRepository.save(user);
        try {
            emailService.sendNewPasswordEmail(email, newPassword);
            return ResponseEntity.ok("Mật khẩu mới đã được gửi đến email của bạn.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Không thể gửi email. Vui lòng thử lại sau.");
        }
    }

    private String generateRandomPassword(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < length; i++) {
            int index = (int) (Math.random() * chars.length());
            sb.append(chars.charAt(index));
        }
        return sb.toString();
    }
}