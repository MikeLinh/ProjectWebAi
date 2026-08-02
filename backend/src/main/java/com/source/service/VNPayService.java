package com.source.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.codec.digest.HmacUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.text.Normalizer;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.regex.Pattern;


@Service
public class VNPayService {
    // Lấy giá trị cấu hình "vnpay.tmn-code" (Mã website định danh)
    @Value("${vnpay.tmn-code}")
    private String vnpTmnCode;
    // Lấy giá trị cấu hình "vnpay.hash-secret" (Khóa bí mật dùng để tạo chữ ký checksum)
    @Value("${vnpay.hash-secret}")
    private String vnpHashSecret;
    // Lấy đường dẫn URL của cổng thanh toán VNPay
    @Value("${vnpay.payment-url}")
    private String vnpPayUrl;
    // Lấy đường dẫn URL mà VNPay sẽ redirect người dùng quay trở lại sau khi thanh toán xong
    @Value("${vnpay.return-url}")
    private String vnpReturnUrl;

    @Value("${vnpay.api-url:https://sandbox.vnpayment.vn/merchant_webapi/api/transaction}")
    private String vnpApiUrl;

    // Định nghĩa biểu mẫu Regular Expression dùng để tìm và lọc bỏ các dấu thanh tiếng Việt
    private static final Pattern DIACRITICS = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");

   public Map<String, String> createPayment(Long orderId, Long amount, String orderInfo) throws Exception {
        Map<String, String> vnpParams = new HashMap<>();
        vnpParams.put("vnp_Version", "2.1.0");
        vnpParams.put("vnp_Command", "pay");
        vnpParams.put("vnp_TmnCode", vnpTmnCode);
        vnpParams.put("vnp_Amount", String.valueOf(amount * 2500000));
        vnpParams.put("vnp_CurrCode", "VND");

        String txnRef = orderId + "_" + System.currentTimeMillis();
        vnpParams.put("vnp_TxnRef", txnRef);

        vnpParams.put("vnp_OrderInfo", toVnpOrderInfo(orderInfo));
        vnpParams.put("vnp_OrderType", "order");
        vnpParams.put("vnp_Locale", "vn");
        vnpParams.put("vnp_BankCode", "NCB");
        vnpParams.put("vnp_ReturnUrl", vnpReturnUrl);
        vnpParams.put("vnp_IpAddr", "127.0.0.1");

        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        vnpParams.put("vnp_CreateDate", formatter.format(cld.getTime()));

        cld.add(Calendar.MINUTE, 15);
        vnpParams.put("vnp_ExpireDate", formatter.format(cld.getTime()));

        List<String> fieldNames = new ArrayList<>(vnpParams.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        for (String fieldName : fieldNames) {
            String fieldValue = vnpParams.get(fieldName);
            if (fieldValue != null && !fieldValue.isEmpty()) {
                hashData.append(fieldName).append("=")
                        .append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8)).append("&");
                query.append(URLEncoder.encode(fieldName, StandardCharsets.UTF_8)).append("=")
                    .append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8)).append("&");
            }
        }

        hashData.setLength(hashData.length() - 1);
        query.setLength(query.length() - 1);

        String vnpSecureHash = hmacSHA512(vnpHashSecret, hashData.toString());
        query.append("&vnp_SecureHash=").append(vnpSecureHash);

        String finalUrl = vnpPayUrl + "?" + query.toString();
        System.out.println("[VNPAY] paymentUrl = " + finalUrl);

        // Trả về cả URL lẫn txnRef để Controller lưu vào Order
        Map<String, String> result = new HashMap<>();
        result.put("payUrl", finalUrl);
        result.put("txnRef", txnRef);
        return result;
    }

    private String toVnpOrderInfo(String input) {
        if (input == null || input.isEmpty()) return "Thanh toan don hang";
        
        // Tách dấu ra khỏi chữ cái gốc
        String noAccent = Normalizer.normalize(input, Normalizer.Form.NFD);
        
        // Sử dụng Regex xóa sạch các dấu tách ra đó
        noAccent = noAccent.replaceAll("\\p{M}", "") // Xóa tất cả các dấu thanh vừa tách
                            .replace('đ', 'd').replace('Đ', 'D')
                            .replaceAll("[^a-zA-Z0-9 ]", " ") // Chỉ giữ lại chữ, số và khoảng trắng
                            .trim().replaceAll("\\s+", " "); // Thu gọn khoảng trắng thừa
                            
        return noAccent.isEmpty() ? "Thanh toan don hang" : noAccent;
    }

    public String hmacSHA512(String key, String data) {
        return new HmacUtils("HmacSHA512", key).hmacHex(data); //Sử dụng framework sẵn của HmacUtils thư viện Apache Commons Codec
    }
    public String getVnpHashSecret() {
        return vnpHashSecret;
    }
    public Map<String, String> createdRefund(
            String txnRef,
            long amount,
            String transactionDate,
            String transactionNo,
            String createBy,
            String orderInfo,
            boolean fullRefund) throws Exception {

        String requestId = UUID.randomUUID().toString().replace("-", "").substring(0, 32);
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String createDate = formatter.format(
                Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7")).getTime());

        String transactionType = fullRefund ? "02" : "03";
        String amountStr = String.valueOf(amount * 100); 
        if (transactionNo == null || transactionNo.isBlank()) {
            transactionNo = "0";
        }

        String data = String.join("|", requestId,
                "2.1.0",
                "refund",
                vnpTmnCode,
                transactionType,
                txnRef,
                amountStr,
                transactionNo,
                transactionDate,
                createBy,
                createDate,
                "127.0.0.1",
                toVnpOrderInfo(orderInfo)
        );

        String secureHash = hmacSHA512(vnpHashSecret, data);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("vnp_RequestId", requestId);
        body.put("vnp_Version", "2.1.0");
        body.put("vnp_Command", "refund");
        body.put("vnp_TmnCode", vnpTmnCode);
        body.put("vnp_TransactionType", transactionType);
        body.put("vnp_TxnRef", txnRef);
        body.put("vnp_Amount", amountStr);
        body.put("vnp_TransactionNo", transactionNo);
        body.put("vnp_TransactionDate", transactionDate);
        body.put("vnp_CreateBy", createBy);
        body.put("vnp_CreateDate", createDate);
        body.put("vnp_IpAddr", "127.0.0.1");
        body.put("vnp_OrderInfo", toVnpOrderInfo(orderInfo));
        body.put("vnp_SecureHash", secureHash);

        ObjectMapper mapper = new ObjectMapper();
        String jsonBody = mapper.writeValueAsString(body);

        System.out.println("[VNPAY REFUND] Request body: " + jsonBody);

        javax.net.ssl.SSLContext sslContext = javax.net.ssl.SSLContext.getInstance("TLS");
        sslContext.init(null, new javax.net.ssl.TrustManager[]{
            new javax.net.ssl.X509TrustManager() {
                public java.security.cert.X509Certificate[] getAcceptedIssuers() { return new java.security.cert.X509Certificate[0]; }
                public void checkClientTrusted(java.security.cert.X509Certificate[] certs, String authType) {}
                public void checkServerTrusted(java.security.cert.X509Certificate[] certs, String authType) {}
            }
        }, new java.security.SecureRandom());

        java.net.http.HttpClient client = java.net.http.HttpClient.newBuilder()
                .sslContext(sslContext)
                .build();

        java.net.http.HttpRequest request = java.net.http.HttpRequest.newBuilder()
                .uri(URI.create(vnpApiUrl))
                .header("Content-Type", "application/json")
                .POST(java.net.http.HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();

        java.net.http.HttpResponse<String> response = client.send(request, java.net.http.HttpResponse.BodyHandlers.ofString());
        System.out.println("[VNPAY REFUND] Response: " + response.body());

        return mapper.readValue(response.body(), new TypeReference<Map<String, String>>() {});
    }
    public String getVnpApiUrl() {
        return vnpApiUrl;
    }
}