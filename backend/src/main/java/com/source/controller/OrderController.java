package com.source.controller;

import com.source.service.ProductService;
import com.source.service.VNPayService;
import com.source.service.WarrantyService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;

import com.source.model.Order;
import com.source.model.OrderDetail;
import com.source.model.Payment;
import com.source.model.Product;
import com.source.repository.OrderRepository;
import com.source.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:5173")
public class OrderController {

    @Autowired private OrderRepository orderRepository;
    @Autowired private PaymentRepository paymentRepository;
    @Autowired private ProductService productService;
    @Autowired private WarrantyService warrantyService;
    @Autowired private VNPayService vnPayService;


    private final Map<Long, List<SseEmitter>> emitters = new ConcurrentHashMap<>();

    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        List<Order> orders = orderRepository.findAllByOrderByOrderDateDesc();
        for(Order order : orders){ 
            paymentRepository.findByOrderId(order.getOrderId()). 
                    ifPresent(payment-> order.setPaymentMethod(payment.getPaymentMethod()));
        }
        return ResponseEntity.ok(orders);
    }

    
    @GetMapping("/{id}")
    public ResponseEntity<Order> getById(@PathVariable Long id) {
        Optional<Order> orderOpt = orderRepository.findById(id);
        if(orderOpt.isPresent()){
            Order order = orderOpt.get();
            paymentRepository.findByOrderId(order.getOrderId()).
                ifPresent(payment -> order.setPaymentMethod(payment.getPaymentMethod()));
            return ResponseEntity.ok(order);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Order>> getByUser(@PathVariable Long userId) {
        List<Order> orders = orderRepository.findByUserIdOrderByOrderDateDesc(userId);
        for (Order order : orders) {
            paymentRepository.findByOrderId(order.getOrderId())
                    .ifPresent(payment -> order.setPaymentMethod(payment.getPaymentMethod()));
        }
        return ResponseEntity.ok(orders);
    }
    @Transactional
    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody Order order) {
        order.setOrderDate(LocalDateTime.now());
        order.setStatus("PENDING");
        if (order.getItems() != null) {
            for (OrderDetail item : order.getItems()) {
                item.setOrder(order);
            }
        }
         try {
            if (order.getItems() != null) {
                for (OrderDetail item : order.getItems()) {
                    productService.decreaseStockForOrder(item.getProductId(), item.getQuantity());
                }
            }
        } catch (IllegalStateException ex) {
                return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
        Order saved = orderRepository.save(order);

        Payment payment = new Payment();
        payment.setOrderId(saved.getOrderId());
        payment.setPaymentMethod(order.getPaymentMethod());
        payment.setAmount(saved.getTotalAmount());
        payment.setPaymentStatus("PENDING");
        paymentRepository.save(payment);

        return ResponseEntity.ok(saved);
    }
    @Transactional
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        Optional<Order> opt = orderRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        String newStatus = body.get("status");
        if (newStatus == null || newStatus.isBlank())
            return ResponseEntity.badRequest().body("Thiếu trường status");

        Order order = opt.get();
        order.setStatus(newStatus);
        orderRepository.save(order);

        if ("DELIVERED".equals(newStatus)) {
            paymentRepository.findByOrderId(id).ifPresent(p -> {
                if ("COD".equals(p.getPaymentMethod())) {
                    p.setPaymentStatus("PAID");
                    p.setPaidAt(LocalDateTime.now());
                    paymentRepository.save(p);
                    
                }
            });
            warrantyService.createWarrantiesForOrder(order);
        }

    
        pushStatusUpdate(id, newStatus);

        return ResponseEntity.ok(order);
    }
    //Định dạng phản hồi: TEXT_EVENT_STREAM_VALUE (Dành riêng cho luồng dữ liệu Server-Sent Events) giữ nguyên API sẽ không cần phải gọi lại
    @GetMapping(value = "/{id}/status-stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamStatus(@PathVariable Long id) {
        SseEmitter emitter = new SseEmitter(30 * 60 * 1000L); 

        emitters.computeIfAbsent(id, k -> new CopyOnWriteArrayList<>()).add(emitter); // Nếu đơn hàng chưa có danh sách cổng kết nối trong Map, tạo mới một danh sách an toàn luồng
        //Gửi trạng thái hiện tại cho client
        orderRepository.findById(id).ifPresent(o -> {
            try {
                emitter.send(SseEmitter.event()
                        .name("status-update") 
                        .data("{\"status\":\"" + o.getStatus() + "\"}")); 
            } catch (IOException e) {
                emitter.completeWithError(e);
            }
        });
        //Thiết lập bộ dọn dẹp tài nguyên của server tránh lưu trữ cổng kết nối gây tràn RAM
        Runnable cleanup = () -> {
            List<SseEmitter> list = emitters.get(id);
            if (list != null) list.remove(emitter);
        };
        emitter.onCompletion(cleanup); 
        emitter.onTimeout(cleanup); 
        emitter.onError(e -> cleanup.run()); 

        return emitter;
    }

    private void pushStatusUpdate(Long orderId, String status) {
        List<SseEmitter> list = emitters.getOrDefault(orderId, List.of());
        String payload = "{\"status\":\"" + status + "\"}"; 

        // Duyệt qua bản sao của danh sách kết nối an toàn để tiến hành gửi dữ liệu
        for (SseEmitter emitter : new CopyOnWriteArrayList<>(list)) {
            try {
                emitter.send(SseEmitter.event()
                        .name("status-update")
                        .data(payload));
                if ("DELIVERED".equals(status)) emitter.complete();
            } catch (IOException e) {
                list.remove(emitter);
            }
        }
    }
        @PatchMapping("/{id}/cancel")
        public ResponseEntity<?> cancelOrder(@PathVariable Long id) {
        Optional<Order> opt = orderRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build(); 
        } 

        Order order = opt.get();
        if (!"PENDING".equals(order.getStatus()) && !"CONFIRMED".equals(order.getStatus())) {
            return ResponseEntity.badRequest().body("Không thể hủy đơn hàng ở trạng thái hiện tại");
        }
        if(order.getItems() != null) {
            for(OrderDetail item : order.getItems()){
                productService.restoreStock(item.getProductId(), item.getQuantity());
            }
        }
        order.setStatus("CANCELLED");
        orderRepository.save(order);
        pushStatusUpdate(id, "CANCELLED");

        return ResponseEntity.ok(order);
    }
    @GetMapping("/sale")
    public ResponseEntity<List<Product>> getSaleProducts() {
        //Gọi những sản phẩm được giảm giá
        List<Product> products = productService.getProductsWithDiscount();
        return ResponseEntity.ok(products);
    }
    @Transactional
    @PatchMapping("/{orderId}/payment-result")
    public ResponseEntity<?> updatePaymentResult(
            @PathVariable Long orderId, 
            @RequestParam("vnp_ResponseCode") String responseCode) {
            
        return orderRepository.findById(orderId).map(order -> {
            Payment payment = paymentRepository.findByOrderId(orderId).orElse(null);

            if ("00".equals(responseCode)) {
                order.setStatus("CONFIRMED"); 
                if (payment != null) {
                    payment.setPaymentStatus("PAID"); 
                }
             
            } else {
                order.setStatus("PENDING"); 
                if (payment != null) {
                    payment.setPaymentStatus("FAILED"); 
                }
            }

            orderRepository.save(order);
            if (payment != null) {
                paymentRepository.save(payment);
            }

            return ResponseEntity.ok(Map.of(
                "message", "Cập nhật trạng thái thanh toán thành công",
                "status", order.getStatus()
            ));
        }).orElse(ResponseEntity.notFound().build());
    }
    @PatchMapping("/{orderId}/cancel")
public ResponseEntity<?> cancelOrder(@PathVariable Long orderId, HttpServletRequest request) {
    Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

    if (!"PENDING".equals(order.getStatus()) && !"CONFIRMED".equals(order.getStatus())) {
        return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Không thể hủy đơn hàng ở trạng thái hiện tại."));
    }
    boolean isVnPay = "VNPAY".equalsIgnoreCase(order.getPaymentMethod());

    if (isVnPay) {
        try {
            // Lấy IP của client
            String ip = request.getRemoteAddr();
            Map<String, String> refundParams = vnPayService.createdRefund(order, "customer", ip);
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("success", false, "message", "Lỗi hoàn tiền VNPAY: " + e.getMessage()));
        }
    }

    order.setStatus("CANCELLED");
    orderRepository.save(order);
    return ResponseEntity.ok(Map.of("success", true, "message", "Đơn hàng đã được hủy và hoàn tiền thành công!"));
}
}