package com.source.controller;

import com.source.service.ProductService;

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

    private final Map<Long, List<SseEmitter>> emitters = new ConcurrentHashMap<>();

    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderRepository.findAllByOrderByOrderDateDesc());
    }

    
    @GetMapping("/{id}")
    public ResponseEntity<Order> getById(@PathVariable Long id) {
        return orderRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Order>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(
                orderRepository.findByUserIdOrderByOrderDateDesc(userId)
        );
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
        }

    
        pushStatusUpdate(id, newStatus);

        return ResponseEntity.ok(order);
    }

    @GetMapping(value = "/{id}/status-stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamStatus(@PathVariable Long id) {
        SseEmitter emitter = new SseEmitter(30 * 60 * 1000L);

        emitters.computeIfAbsent(id, k -> new CopyOnWriteArrayList<>()).add(emitter);

        orderRepository.findById(id).ifPresent(o -> {
            try {
                emitter.send(SseEmitter.event()
                        .name("status-update")
                        .data("{\"status\":\"" + o.getStatus() + "\"}"));
            } catch (IOException e) {
                emitter.completeWithError(e);
            }
        });

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
        List<Product> products = productService.getProductsWithDiscount();
        return ResponseEntity.ok(products);
    }
}