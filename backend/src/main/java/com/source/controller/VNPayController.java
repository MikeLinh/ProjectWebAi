package com.source.controller;

import com.source.repository.OrderRepository;
import com.source.repository.PaymentRepository;
import com.source.service.VNPayService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
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

    // Hàm khởi tạo 
    public VNPayController(VNPayService vnpayService, OrderRepository orderRepository, PaymentRepository paymentRepository) {
        this.vnpayService = vnpayService;
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
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
}