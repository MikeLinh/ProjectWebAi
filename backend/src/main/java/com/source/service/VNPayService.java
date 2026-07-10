package com.source.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.Normalizer;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.regex.Pattern;

@Service
public class VNPayService {

    @Value("${vnpay.tmn-code}")
    private String vnpTmnCode;

    @Value("${vnpay.hash-secret}")
    private String vnpHashSecret;

    @Value("${vnpay.payment-url}")
    private String vnpPayUrl;

    @Value("${vnpay.return-url}")
    private String vnpReturnUrl;

    private static final Pattern DIACRITICS = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");

    public String createPayment(Long orderId, Long amount, String orderInfo) throws Exception {
        Map<String, String> vnpParams = new HashMap<>();
        vnpParams.put("vnp_Version", "2.1.0");
        vnpParams.put("vnp_Command", "pay");
        vnpParams.put("vnp_TmnCode", vnpTmnCode);
        vnpParams.put("vnp_Amount", String.valueOf(amount * 2500000));
        vnpParams.put("vnp_CurrCode", "VND");
        vnpParams.put("vnp_TxnRef",
        orderId + "_" + System.currentTimeMillis());
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

                hashData.append(fieldName)
                        .append("=")
                        .append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8))
                        .append("&");

                query.append(URLEncoder.encode(fieldName, StandardCharsets.UTF_8))
                    .append("=")
                    .append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8))
                    .append("&");
            }
        }

        hashData.setLength(hashData.length() - 1);
        query.setLength(query.length() - 1);

        String vnpSecureHash = hmacSHA512(vnpHashSecret, hashData.toString());
        query.append("&vnp_SecureHash=").append(vnpSecureHash);

        String finalUrl = vnpPayUrl + "?" + query.toString();
        System.out.println("[VNPAY] paymentUrl = " + finalUrl);
        return finalUrl;
    }

    private String toVnpOrderInfo(String input) {
        if (input == null || input.isEmpty()) {
            return "Thanh toan don hang";
        }
        String noAccent = Normalizer.normalize(input, Normalizer.Form.NFD);
        noAccent = DIACRITICS.matcher(noAccent).replaceAll("");
        noAccent = noAccent.replace('đ', 'd').replace('Đ', 'D');
        noAccent = noAccent.replaceAll("[^a-zA-Z0-9 .,]", " ");
        noAccent = noAccent.trim().replaceAll("\\s+", " ");
        return noAccent.isEmpty() ? "Thanh toan don hang" : noAccent;
    }

    public String hmacSHA512(String key, String data) throws Exception {
        javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA512");
        mac.init(new javax.crypto.spec.SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512"));
        byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        StringBuilder hex = new StringBuilder();
        for (byte b : hash) {
            hex.append(String.format("%02x", b));
        }
        return hex.toString();
    }
    public String getVnpHashSecret() {
        return vnpHashSecret;
    }
}