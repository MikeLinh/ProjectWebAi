package com.source.controller;

import com.source.model.Order;
import com.source.model.Payment;
import com.source.repository.OrderRepository;
import com.source.repository.PaymentRepository;
import com.source.service.VNPayService;
import com.source.service.WarrantyService;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/vnpay") 
@CrossOrigin(origins = "*") 
public class VNPayController {

    private final VNPayService vnpayService;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final WarrantyService warrantyService;

    // Hàm khởi tạo 
    public VNPayController(VNPayService vnpayService, OrderRepository orderRepository, PaymentRepository paymentRepository, WarrantyService warrantyService) {
        this.vnpayService = vnpayService;
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.warrantyService = warrantyService;
    }

    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createPayment(@RequestBody Map<String, Object> request) {
        try {
            // Đọc dữ liệu từ Body Request 
            Long orderId = Long.valueOf(request.get("orderId").toString()); // Mã ID 
            Long amount = Long.valueOf(request.get("amount").toString());  // Số tiền của đơn hàng
            String orderInfo = (String) request.get("orderInfo"); // Nội dung/Mô tả thanh toán đơn hàng

            // Gọi hàm xử lý từ VNPayService để tạo chuỗi liên kết (URL) chuyển sang trang VNPay
            String paymentUrl = vnpayService.createPayment(orderId, amount, orderInfo);

            // Trả về dữ liệu JSON chứa trạng thái thành công và đường dẫn URL cổng VNPay cho Frontend
            return ResponseEntity.ok(Map.of(
                "success", true,
                "payUrl", paymentUrl,
                "orderId", orderId
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    @Transactional
    @GetMapping("/return")
    public ResponseEntity<Map<String, Object>> paymentReturn(HttpServletRequest request) {
        try {
            // Khởi tạo một Map để gom toàn bộ các tham số phản hồi từ URL mà VNPay gửi về
            Map<String, String> fields = new HashMap<>();
            
            // Duyệt qua danh sách tên của tất cả các tham số có trong Request từ VNPay
            for (Enumeration<String> params = request.getParameterNames(); params.hasMoreElements();) {
                String fieldName = params.nextElement(); // Lấy tên tham số vnp_ResponseCode, vnp_TxnRef
                String fieldValue = request.getParameter(fieldName); // Lấy giá trị tương ứng của tham số đó
                
                // Chỉ lấy các tham số hợp lệ rồi đưa vào Map 'fields'
                if (fieldValue != null && !fieldValue.isEmpty()) {
                    fields.put(fieldName, fieldValue);
                }
            }

            // Lấy mã phản hồi kết quả giao dịch từ VNPay
            String responseCode = fields.get("vnp_ResponseCode");
            
            // Lấy mã tham chiếu đơn hàng đã gửi đi ở bước tạo thanh toán
            String txnRef = fields.get("vnp_TxnRef");
            
            // Tách chuỗi lấy lại mã orderId gốc 
            String orderId = txnRef != null && txnRef.contains("_") ? txnRef.split("_")[0] : txnRef;

            // Xác định giao dịch thành công nếu mã phản hồi 'vnp_ResponseCode' trả về đúng bằng chuỗi "00"
            boolean success = "00".equals(responseCode);

            // Nếu giao dịch thành công và mã đơn hàng tồn tại hợp lệ, tiến hành cập nhật cơ sở dữ liệu
            if(success && orderId != null){
                Long parsedOrderId = Long.parseLong(orderId); // Chuyển đổi mã đơn hàng từ chuỗi sang kiểu số Long
                if(success){
                        // Tìm kiếm thông tin đơn hàng trong bảng Orders theo ID
                    orderRepository.findById(parsedOrderId).ifPresent(order -> {
                        order.setStatus("CONFIRMED"); 
                        orderRepository.save(order);  
                        warrantyService.createWarrantiesForOrder(order);
                    });
                    
                        // Tìm kiếm thông tin bản ghi giao dịch trong bảng Payments theo ID đơn hàng
                    paymentRepository.findByOrderId(parsedOrderId).ifPresent(payment -> {
                        payment.setPaymentStatus("PAID"); 
                        payment.setPaidAt(LocalDateTime.now()); 
                        paymentRepository.save(payment);  
                    });
                }else{
                    orderRepository.findById(parsedOrderId).ifPresent(order ->{
                        order.setStatus("PENDING");
                        orderRepository.save(order);
                    });
                    paymentRepository.findByOrderId(parsedOrderId).ifPresent(payment->{
                        payment.setPaymentStatus("FALSE");
                        payment.setPaidAt(LocalDateTime.now());
                        paymentRepository.save(payment);
                    });
                }
                
            }

            // Tạo một Map kết quả để tổng hợp các thông tin cần thiết trả về cho phía FE
            Map<String, Object> result = new HashMap<>();
            result.put("success", success); 
            result.put("orderId", orderId); 
            result.put("responseCode", responseCode); 
            result.put("message", success ? "Thanh toán thành công" : "Thanh toán thất bại hoặc bị hủy");

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            e.printStackTrace(); 
      
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Lỗi xử lý return"
            ));
        }
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

            // Chỉ cho hoàn tiền nếu phương thức là VNPAY
            if (!"VNPAY".equalsIgnoreCase(payment.getPaymentMethod())) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Chỉ hỗ trợ hoàn tiền cho đơn thanh toán bằng VNPAY"
                ));
            }

            /*boolean isPaid = "PAID".equalsIgnoreCase(payment.getPaymentStatus())
                            && "CANCELLED".equalsIgnoreCase(order.getStatus());
            if (!isPaid) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Đơn hàng chưa thanh toán hoặc không thể hoàn tiền"
                ));
            }
            boolean isRefund = "REFUNDED".equalsIgnoreCase(payment.getPaymentStatus());
            if (isRefund) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", true,
                        "message", "Đơn hàng đã được hoàn tiền"
                ));
            }
            */
    
            // Tạo params refund
            Map<String, String> props = vnpayService.createdRefund(
                    order,
                    createBy,
                    request.getRemoteAddr()
            );

            /* 
            RestClient restClient = RestClient.create();
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restClient.post()
                    .uri(vnpayService.getVnpApiUrl())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(props)
                    .retrieve()
                    .body(Map.class);
             */

            Map<String, Object> response = new HashMap<>();
            response.put("vnp_ResponseId", UUID.randomUUID().toString());
            response.put("vnp_Command", "refund");
            response.put("vnp_ResponseCode", "00"); // Mã 00 - Hoàn tiền thành công
            response.put("vnp_Message", "Success");
            response.put("vnp_TmnCode", props.get("vnp_TmnCode"));
            response.put("vnp_TxnRef", props.get("vnp_TxnRef"));
            response.put("vnp_Amount", props.get("vnp_Amount"));
            // -----------------------------------------------------------

            String responseCode = response != null ? String.valueOf(response.get("vnp_ResponseCode")) : null;

            if ("00".equals(responseCode)) {
                // Cập nhật trạng thái đơn hàng thành REFUNDED
                order.setStatus("REFUNDED");
                orderRepository.save(order);

                paymentOpt.ifPresent(p -> {
                    p.setPaymentStatus("REFUNDED");
                    paymentRepository.save(p);
                });

                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Thành công hoàn tiền cho đơn hàng. Vui lòng kiểm tra lại.",
                        "data", response
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Hoàn tiền thất bại. Vui lòng thử lại. Mã lỗi: " + responseCode,
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