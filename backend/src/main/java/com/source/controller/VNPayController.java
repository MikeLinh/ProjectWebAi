package com.source.controller;

import com.source.model.Order;
import com.source.model.Payment;
import com.source.repository.OrderRepository;
import com.source.repository.PaymentRepository;
import com.source.service.VNPayService;
import com.source.service.WarrantyService;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;

@RestController
@RequestMapping("/api/vnpay") 
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
            Long orderId = Long.valueOf(request.get("orderId").toString());
            Long amount = Long.valueOf(request.get("amount").toString());
            String orderInfo = (String) request.get("orderInfo");

            Map<String, String> paymentResult = vnpayService.createPayment(orderId, amount, orderInfo);

            // KHÔNG lưu vnpTxnRef ở đây nữa — chỉ lưu khi thanh toán thực sự thành công (ở /return)
            return ResponseEntity.ok(Map.of(
                "success", true,
                "payUrl", paymentResult.get("payUrl"),
                "orderId", orderId
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
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

            // Sửa lỗi logic: Kiểm tra trực tiếp sự tồn tại của orderId và phân nhánh rõ ràng theo success
            if (orderId != null) {
                Long parsedOrderId = Long.parseLong(orderId); // Chuyển đổi mã đơn hàng từ chuỗi sang kiểu số Long
                
                if (success) {
                    // Tìm kiếm thông tin đơn hàng trong bảng Orders theo ID để cập nhật CONFIRMED
                    orderRepository.findById(parsedOrderId).ifPresent(order -> {
                        order.setStatus("CONFIRMED"); 
                        order.setVnpTxnRef(txnRef);
                        orderRepository.save(order);  
                        warrantyService.createWarrantiesForOrder(order);
                    });
                    
                    // Tìm kiếm thông tin bản ghi giao dịch trong bảng Payments theo ID đơn hàng để cập nhật PAID
                    paymentRepository.findByOrderId(parsedOrderId).ifPresent(payment -> {
                        payment.setPaymentStatus("PAID"); 
                        payment.setPaidAt(LocalDateTime.now()); 
                        paymentRepository.save(payment);  
                    });
                } else {
                    // Trường hợp thanh toán thất bại hoặc bị hủy
                    orderRepository.findById(parsedOrderId).ifPresent(order -> {
                        order.setStatus("PENDING");
                        orderRepository.save(order);
                    });
                    paymentRepository.findByOrderId(parsedOrderId).ifPresent(payment -> {
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

            if (!"VNPAY".equalsIgnoreCase(payment.getPaymentMethod())) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Chỉ hỗ trợ hoàn tiền cho đơn thanh toán bằng VNPAY"
                ));
            }

            // LẤY TRỰC TIẾP MÃ GỐC TỪ DB ĐỂ KHỚP VỚI HỆ THỐNG VNPAY
            String txnRef = order.getVnpTxnRef();
            if (txnRef == null || txnRef.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Đơn hàng này chưa có mã giao dịch VNPAY gốc (vnpTxnRef)!"
                ));
            }
            if (payment.getPaidAt() == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Đơn hàng chưa có thời điểm thanh toán hợp lệ, không thể hoàn tiền"
            ));
}

            // Format ngày giao dịch ban đầu của đơn hàng
            SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
            String transactionDate = formatter.format(
                Date.from(order.getOrderDate().atZone(ZoneId.of("Asia/Ho_Chi_Minh")).toInstant())
            );

            // Gọi hàm tạo yêu cầu hoàn tiền với mã gốc
            long amountInVnd = order.getTotalAmount().longValue();

        Map<String, String> props = vnpayService.createdRefund(
                txnRef,
                amountInVnd,
                transactionDate,
                "0",
                createBy,
                "Hoan tien cho don hang " + order.getOrderId(),
                true
        );

            // Bỏ qua lỗi SSL khi gọi API Sandbox của VNPay
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
                    .baseUrl(vnpayService.getVnpApiUrl())
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
                        "message", "Thành công hoàn tiền cho đơn hàng",
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