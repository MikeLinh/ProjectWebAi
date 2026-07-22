package com.source.service;

import org.apache.commons.codec.digest.HmacUtils;
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

    // Định nghĩa biểu mẫu Regular Expression dùng để tìm và lọc bỏ các dấu thanh tiếng Việt
    private static final Pattern DIACRITICS = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");

    public String createPayment(Long orderId, Long amount, String orderInfo) throws Exception {
        Map<String, String> vnpParams = new HashMap<>(); //Khởi tạo map để lưu trữ các tham số gửi sang cổng VNPAY
        vnpParams.put("vnp_Version", "2.1.0");
        vnpParams.put("vnp_Command", "pay");
        vnpParams.put("vnp_TmnCode", vnpTmnCode);
        vnpParams.put("vnp_Amount", String.valueOf(amount * 2500000));
        vnpParams.put("vnp_CurrCode", "VND");
        vnpParams.put("vnp_TxnRef",
        orderId + "_" + System.currentTimeMillis()); //Thiết lập mã đơn hàng trùng với thời gian hiện tại tránh làm trùng đơn
        vnpParams.put("vnp_OrderInfo", toVnpOrderInfo(orderInfo)); //Thiết lập thông tin bằng tiếng việt không dấu
        vnpParams.put("vnp_OrderType", "order");
        vnpParams.put("vnp_Locale", "vn");
        vnpParams.put("vnp_BankCode", "NCB");
        vnpParams.put("vnp_ReturnUrl", vnpReturnUrl);
        vnpParams.put("vnp_IpAddr", "127.0.0.1");

        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        vnpParams.put("vnp_CreateDate", formatter.format(cld.getTime()));

        cld.add(Calendar.MINUTE, 15); //Thời gian thanh toán
        vnpParams.put("vnp_ExpireDate", formatter.format(cld.getTime())); //Khi hết thời gian thanh toán thì gán mặc định là ExpireDate

        
        List<String> fieldNames = new ArrayList<>(vnpParams.keySet()); //lấy ra các danh sách các tham số key đang có trong map
        Collections.sort(fieldNames); //sắp xếp theo bảng chữ cái alphabet của VNpay
        StringBuilder hashData = new StringBuilder(); //Chuỗi chưa mã hoá dùng để tính mã bảo mật SHA512
        StringBuilder query = new StringBuilder(); //Tạo 1 chuỗi truy vấn query đã đc mã hoá

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
}