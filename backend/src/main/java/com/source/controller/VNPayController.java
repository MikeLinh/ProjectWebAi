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

    public VNPayController(VNPayService vnpayService, OrderRepository orderRepository, PaymentRepository paymentRepository) {
        this.vnpayService = vnpayService;
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
    }

    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createPayment(@RequestBody Map<String, Object> request) {
        try {
            Long orderId = Long.valueOf(request.get("orderId").toString());
            Long amount = Long.valueOf(request.get("amount").toString());
            String orderInfo = (String) request.get("orderInfo");

            String paymentUrl = vnpayService.createPayment(orderId, amount, orderInfo);

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
            Map<String, String> fields = new HashMap<>();
            for (Enumeration<String> params = request.getParameterNames(); params.hasMoreElements();) {
                String fieldName = params.nextElement();
                String fieldValue = request.getParameter(fieldName);
                if (fieldValue != null && !fieldValue.isEmpty()) {
                    fields.put(fieldName, fieldValue);
                }
            }

            String responseCode = fields.get("vnp_ResponseCode");
            String txnRef = fields.get("vnp_TxnRef");
            String orderId = txnRef != null && txnRef.contains("_") ? txnRef.split("_")[0] : txnRef;

            boolean success = "00".equals(responseCode);

            if(success && orderId != null){
                Long parsedOrderId = Long.parseLong(orderId);

                orderRepository.findById(parsedOrderId).ifPresent(order -> {
                    order.setStatus("CONFIRMED");
                    orderRepository.save(order);
                });
                paymentRepository.findByOrderId(parsedOrderId).ifPresent(payment -> {
                    payment.setPaymentStatus("PAID");
                    payment.setPaidAt(LocalDateTime.now());
                    paymentRepository.save(payment);
                });
            }

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