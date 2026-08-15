package com.source.controller;

import com.source.service.ProductService;
import com.source.service.VNPayService;
import com.source.service.WarrantyService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;

import com.source.model.Order;
import com.source.model.OrderDetail;
import com.source.model.Payment;
import com.source.repository.OrderRepository;
import com.source.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@RestController
@RequestMapping("/api/orders")
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
            paymentRepository.findByOrderId(order.getOrderId())
                    .ifPresent(payment-> order.setPaymentMethod(payment.getPaymentMethod()));
        }
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getById(@PathVariable Long id) {
        Optional<Order> orderOpt = orderRepository.findById(id);
        if(orderOpt.isPresent()){
            Order order = orderOpt.get();
            paymentRepository.findByOrderId(order.getOrderId())
                .ifPresent(payment -> order.setPaymentMethod(payment.getPaymentMethod()));
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

        if ("DELIVERED".equals(newStatus)) {
            Payment existing = paymentRepository.findByOrderId(id).orElse(null);
            boolean isCod = existing != null && "COD".equals(existing.getPaymentMethod());
            syncOrderAndPayment(order, newStatus, isCod ? "PAID" : null); 
            warrantyService.createWarrantiesForOrder(order);
        } else {
            syncOrderAndPayment(order, newStatus, null); 
        }

        pushStatusUpdate(id, newStatus);
        return ResponseEntity.ok(order);
    }

    private void syncOrderAndPayment(Order order, String orderStatus, String paymentStatus) {
        order.setStatus(orderStatus);
        orderRepository.save(order);
        if (paymentStatus != null) {
            paymentRepository.findByOrderId(order.getOrderId()).ifPresent(payment -> {
                payment.setPaymentStatus(paymentStatus);
                paymentRepository.save(payment);
            });
        }
    }
    @Transactional
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable Long id) {
        Optional<Order> opt = orderRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        Order order = opt.get();

        List<String> cancellableStatuses = List.of("PENDING", "CONFIRMED","PAID");
        if (!cancellableStatuses.contains(order.getStatus())) {
            return ResponseEntity.badRequest().body(Map.of(
                "message", "Không thể huỷ đơn hàng ở trạng thái hiện tại: " + order.getStatus()
            ));
        }

        if (order.getItems() != null) {
            for (OrderDetail item : order.getItems()) {
                productService.restoreStock(item.getProductId(), item.getQuantity());;
            }
        }
     

        order.setStatus("CANCELLED");
        orderRepository.save(order);

        paymentRepository.findByOrderId(id).ifPresent(payment -> {
            payment.setPaymentStatus("CANCELLED");
            paymentRepository.save(payment);
        });

        pushStatusUpdate(id, "CANCELLED");
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
    @Transactional
    @PatchMapping("/{id}/payment-result")
    public ResponseEntity<?> updatePaymentResult(
            @PathVariable Long id,
            @RequestParam("vnp_ResponseCode") String responseCode,
            @RequestParam(value = "vnp_TxnRef", required = false) String txnRef){

        Optional<Order> orderOpt = orderRepository.findById(id);
        if (orderOpt.isEmpty()) return ResponseEntity.notFound().build();

        Order order = orderOpt.get();
        boolean success = "00".equals(responseCode);

        if (success) {
            order.setStatus("CONFIRMED");
            if(txnRef != null && !txnRef.isBlank()) {
                order.setVnpTxnRef(txnRef);
            }
            orderRepository.save(order);
            warrantyService.createWarrantiesForOrder(order);
            paymentRepository.findByOrderId(id).ifPresent(payment -> {
                payment.setPaymentStatus("PAID");
                payment.setPaidAt(LocalDateTime.now());
                paymentRepository.save(payment);
            });
        } else {
            order.setStatus("PENDING");
            orderRepository.save(order);
            paymentRepository.findByOrderId(id).ifPresent(payment -> {
                payment.setPaymentStatus("FALSE");
                paymentRepository.save(payment);
            });
        }

        return ResponseEntity.ok(Map.of("success", success, "status", order.getStatus()));
    }

    @Transactional
    @PostMapping("/refund")
    public ResponseEntity<?> refundOrder(@RequestBody Map<String, Object> body,
                                         HttpServletRequest request) {
        try {
            Long orderId = Long.valueOf(body.get("orderId").toString());
            String createBy = body.getOrDefault("createBy", "admin").toString();

            Optional<Order> orderOpt = orderRepository.findById(orderId);
            if (orderOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Không tìm thấy đơn hàng"
                ));
            }

            Order order = orderOpt.get();
            Optional<Payment> paymentOpt = paymentRepository.findByOrderId(orderId);

            if (paymentOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Không tìm thấy thông tin thanh toán của đơn hàng"
                ));
            }

            Payment payment = paymentOpt.get();

            if (!"VNPAY".equalsIgnoreCase(payment.getPaymentMethod())) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Chỉ hỗ trợ hoàn tiền cho đơn thanh toán bằng VNPAY"
                ));
            }

            String txnRef = order.getVnpTxnRef();
            if (txnRef == null || txnRef.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Đơn hàng này chưa có mã giao dịch VNPAY gốc (vnpTxnRef)!"
                ));
            }

            SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
            String transactionDate = formatter.format(
                Date.from(order.getOrderDate().atZone(ZoneId.of("Asia/Ho_Chi_Minh")).toInstant())
            );

            long amountInVnd = order.getTotalAmount().longValue();

            Map<String, String> props = vnPayService.createdRefund(
                    txnRef,
                    amountInVnd,
                    transactionDate,
                    "0",
                    createBy,
                    "Hoan tien cho don hang " + order.getOrderId(),
                    true
            );
            javax.net.ssl.SSLContext sslContext = javax.net.ssl.SSLContext.getInstance("TLS");
            sslContext.init(null, new javax.net.ssl.TrustManager[]{
                new javax.net.ssl.X509TrustManager() {
                    public java.security.cert.X509Certificate[] getAcceptedIssuers() { return new java.security.cert.X509Certificate[0]; }
                    public void checkClientTrusted(java.security.cert.X509Certificate[] certs, String authType) {}
                    public void checkServerTrusted(java.security.cert.X509Certificate[] certs, String authType) {}
                }
            }, new java.security.SecureRandom());

            org.springframework.http.client.SimpleClientHttpRequestFactory requestFactory = new org.springframework.http.client.SimpleClientHttpRequestFactory() {
                @Override
                protected void prepareConnection(java.net.HttpURLConnection connection, String httpMethod) throws java.io.IOException {
                    if (connection instanceof javax.net.ssl.HttpsURLConnection) {
                        ((javax.net.ssl.HttpsURLConnection) connection).setSSLSocketFactory(sslContext.getSocketFactory());
                        ((javax.net.ssl.HttpsURLConnection) connection).setHostnameVerifier((s, sslSession) -> true);
                    }
                    super.prepareConnection(connection, httpMethod);
                }
            };

            RestClient restClient = RestClient.builder()
                    .requestFactory(requestFactory)
                    .baseUrl(vnPayService.getVnpApiUrl())
                    .build();

            @SuppressWarnings("unchecked")
            Map<String, Object> response = restClient.post()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(props)
                    .retrieve()
                    .body(Map.class);

            String responseCode = response != null ? String.valueOf(response.get("vnp_ResponseCode")) : null;

            if ("00".equals(responseCode)) {
                order.setStatus("REFUNDED");
                orderRepository.save(order);

                paymentOpt.ifPresent(p -> {
                    p.setPaymentStatus("REFUNDED");
                    paymentRepository.save(p);
                });

                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Thành công hoàn tiền cho đơn hàng.",
                        "data", response
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Thành công hoàn tiền cho đơn hàng: " + responseCode,
                        "data", response
                ));
            }

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Lỗi khi hoàn tiền: " + e.getMessage()
            ));
        }
    }
}