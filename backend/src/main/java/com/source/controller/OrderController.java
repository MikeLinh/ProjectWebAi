package com.source.controller;

import com.source.service.ProductService;
import com.source.service.WarrantyService;

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

    //Khởi tạo một Map an toàn đa luồng (Thread-safe) để lưu danh sách các kết nối SseEmitter (giám sát trạng thái đơn hàng thời gian thực)
    private final Map<Long, List<SseEmitter>> emitters = new ConcurrentHashMap<>();

    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        List<Order> orders = orderRepository.findAllByOrderByOrderDateDesc();
        // Lặp qua từng đơn hàng để tìm và nạp thêm thông tin phương thức thanh toán tương ứng
        for(Order order : orders){ 
            paymentRepository.findByOrderId(order.getOrderId()). 
                    ifPresent(payment-> order.setPaymentMethod(payment.getPaymentMethod()));
        }
        return ResponseEntity.ok(orders);
    }

    
    @GetMapping("/{id}")
    public ResponseEntity<Order> getById(@PathVariable Long id) {
        // Tìm kiếm đơn hàng theo ID truyền vào từ URL
        Optional<Order> orderOpt = orderRepository.findById(id);
        if(orderOpt.isPresent()){
            Order order = orderOpt.get();
            // Tìm thông tin thanh toán đi kèm đơn hàng để bổ sung phương thức thanh toán
            paymentRepository.findByOrderId(order.getOrderId()).
                ifPresent(payment -> order.setPaymentMethod(payment.getPaymentMethod()));
            return ResponseEntity.ok(order);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Order>> getByUser(@PathVariable Long userId) {
        List<Order> orders = orderRepository.findByUserIdOrderByOrderDateDesc(userId);
        // Lặp qua từng đơn hàng của người dùng để bổ sung thêm phương thức thanh toán
        for (Order order : orders) {
            paymentRepository.findByOrderId(order.getOrderId())
                    .ifPresent(payment -> order.setPaymentMethod(payment.getPaymentMethod()));
        }
        return ResponseEntity.ok(orders);
    }
    @Transactional
    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody Order order) {
        // Gán thời gian đặt hàng hiện tại cho đơn hàng
        order.setOrderDate(LocalDateTime.now());
        order.setStatus("PENDING");
        // Thiết lập liên kết hai chiều giữa đơn hàng (Order) và các chi tiết đơn hàng (OrderDetail) để Hibernate lưu đúng dữ liệu
        if (order.getItems() != null) {
            for (OrderDetail item : order.getItems()) {
                item.setOrder(order);
            }
        }
        // Thực hiện trừ số lượng sản phẩm trong kho hàng (Stock) khi khách đặt hàng
         try {
            if (order.getItems() != null) {
                for (OrderDetail item : order.getItems()) {
                    // Gọi hàm giảm số lượng tồn kho của từng sản phẩm dựa theo số lượng mua
                    productService.decreaseStockForOrder(item.getProductId(), item.getQuantity());
                }
            }
        } catch (IllegalStateException ex) {
            //Nếu số lượng tồn kho thiếu thì báo lỗi
                return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
        // Thực hiện lưu đơn hàng vào bảng Orders trong Database
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
        // Tìm đơn hàng cần cập nhật theo ID    
        Optional<Order> opt = orderRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        // Lấy trạng thái mới truyền lên từ phần Body của Request
        String newStatus = body.get("status");
        if (newStatus == null || newStatus.isBlank())
            return ResponseEntity.badRequest().body("Thiếu trường status");

        Order order = opt.get();
        order.setStatus(newStatus);
        orderRepository.save(order);

        // Xử lý thanh toán tự động khi đơn hàng COD được chuyển thành trạng thái "DELIVERED" (Đã giao thành công)
        if ("DELIVERED".equals(newStatus)) {
            paymentRepository.findByOrderId(id).ifPresent(p -> {
                if ("COD".equals(p.getPaymentMethod())) {
                    p.setPaymentStatus("PAID");
                    p.setPaidAt(LocalDateTime.now());
                    paymentRepository.save(p);
                    warrantyService.createWarrantiesForOrder(order);
                }
            });
        }

    
        pushStatusUpdate(id, newStatus);

        return ResponseEntity.ok(order);
    }
    //Định dạng phản hồi: TEXT_EVENT_STREAM_VALUE (Dành riêng cho luồng dữ liệu Server-Sent Events) giữ nguyên API sẽ không cần phải gọi lại
    @GetMapping(value = "/{id}/status-stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamStatus(@PathVariable Long id) {
        SseEmitter emitter = new SseEmitter(30 * 60 * 1000L); //thời gian timeout 30p

        emitters.computeIfAbsent(id, k -> new CopyOnWriteArrayList<>()).add(emitter); // Nếu đơn hàng chưa có danh sách cổng kết nối trong Map, tạo mới một danh sách an toàn luồng

        //Gửi trạng thái hiện tại cho client
        orderRepository.findById(id).ifPresent(o -> {
            try {
                emitter.send(SseEmitter.event()
                        .name("status-update") //Tên sự kiện
                        .data("{\"status\":\"" + o.getStatus() + "\"}")); //Dữ liệu trạng thái
            } catch (IOException e) {
                emitter.completeWithError(e);
            }
        });
        //Thiết lập bộ dọn dẹp tài nguyên của server tránh lưu trữ cổng kết nối gây tràn RAM
        Runnable cleanup = () -> {
            List<SseEmitter> list = emitters.get(id);
            if (list != null) list.remove(emitter);
        };
        emitter.onCompletion(cleanup); //Xoá khi hoàn thành
        emitter.onTimeout(cleanup); // Xoá khi hết thời gian timeout
        emitter.onError(e -> cleanup.run()); //Khi gặp lỗi kết nối
        //Trả về emitter cho client giữ kết nối tới sever
        return emitter;
    }

    private void pushStatusUpdate(Long orderId, String status) {
        //Lấy tất cả danh sách SSE đang giữ kết nối với đơn hàng này
        List<SseEmitter> list = emitters.getOrDefault(orderId, List.of());
        String payload = "{\"status\":\"" + status + "\"}"; //Chuỗi JSON chứa trạng thái mới

        // Duyệt qua bản sao của danh sách kết nối an toàn để tiến hành gửi dữ liệu
        for (SseEmitter emitter : new CopyOnWriteArrayList<>(list)) {
            try {
                //Gửi sự kiện cập nhập trạng thái
                emitter.send(SseEmitter.event()
                        .name("status-update")
                        .data(payload));
                //Nếu là đơn hàng giao hàng thành công sẽ là (DELIVERED)
                if ("DELIVERED".equals(status)) emitter.complete();
            } catch (IOException e) {
                list.remove(emitter);
            }
        }
    }
        @PatchMapping("/{id}/cancel")
        public ResponseEntity<?> cancelOrder(@PathVariable Long id) {
        //Tìm đơn hàng theo ID
        Optional<Order> opt = orderRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build(); // Trả về 404
        } 

        Order order = opt.get();
        //Chỉ cho phép huỷ đơn hàng ở 2 trạng thái PENDING và CONFIRMED
        if (!"PENDING".equals(order.getStatus()) && !"CONFIRMED".equals(order.getStatus())) {
            return ResponseEntity.badRequest().body("Không thể hủy đơn hàng ở trạng thái hiện tại");
        }
        //Trả lại số lượng tồn kho nếu đơn hàng bị huỷ
        if(order.getItems() != null) {
            for(OrderDetail item : order.getItems()){
                productService.restoreStock(item.getProductId(), item.getQuantity());
            }
        }
        //Set trạng thái huỷ
        order.setStatus("CANCELLED");
        orderRepository.save(order);
        //Gửi FE trạng thái huỷ cập nhập theo SSE
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

            // "00" là mã giao dịch thành công của VNPay
            if ("00".equals(responseCode)) {
                order.setStatus("CONFIRMED"); // Thanh toán thành công -> Đổi sang CONFIRMED
                if (payment != null) {
                    payment.setPaymentStatus("PAID"); 
                }
                warrantyService.createWarrantiesForOrder(order);
            } else {
                order.setStatus("PENDING"); // Thất bại -> Giữ nguyên PENDING để thanh toán lại
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
}