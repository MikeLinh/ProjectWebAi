package com.source.controller;

import com.source.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/overview")
@CrossOrigin(origins = "http://localhost:5173")
public class OverviewController {

    @Autowired private OrderRepository orderRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private PromotionRepository promotionRepository;
    @Autowired private UserRepository userRepository;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(
            @RequestParam(required = false) Integer month, 
            @RequestParam(required = false) Integer year) {

        var allOrders = orderRepository.findAll();
        //Lọc danh sách đơn hàng dựa trên tham số Tháng Năm của FE
        var filtered = allOrders.stream().filter(o -> {
            if (o.getOrderDate() == null) return false; //Loại bỏ đơn hàng không có ngày tháng
            //Điều kiện năm nếu không chọn gì (year=null) thì coi như kiểm trả tất cả năm còn lại nếu chọn cụ thể thì sẽ thực hiện điều kiện 2
            boolean matchYear = (year == null || o.getOrderDate().getYear() == year); 
            boolean matchMonth = (month == null || o.getOrderDate().getMonthValue() == month);
            return matchYear && matchMonth;
        }).toList();

        //Tính tổng doanh thu chỉ dựa vào những đơn hàng đã giao thành công
        BigDecimal totalRevenue = filtered.stream()
                .filter(o -> "DELIVERED".equals(o.getStatus())) //Lọc đơn hàng
                .map(o -> o.getTotalAmount() != null ? o.getTotalAmount() : BigDecimal.ZERO) //Lấy giá của đơn hàng
                .reduce(BigDecimal.ZERO, BigDecimal::add); //Cộng dồn tất cả giá trị đơn hàng bắt đầu từ 0

        //Đếm số lượng đơn hàng đang chờ xử lý
        long pendingOrders = filtered.stream()
                .filter(o -> "PENDING".equals(o.getStatus())).count();
        
        //Tổng số lượng đơn hàng phát sinh
        long totalOrders = filtered.size();

        //Đếm số lượng đơn hàng huỷ
        long cancelledOrders = filtered.stream()
                .filter(o -> "CANCELLED".equals(o.getStatus())).count();

        // Thống kê tổng số lượng không dựa vào ngày tháng năm
        long totalProducts = productRepository.count();
        long totalUsers = userRepository.count();
        
        //Đếm số lượng khuyến mãi hiện tại
        LocalDateTime now = LocalDateTime.now();
        long activePromos = promotionRepository.findAll().stream()
                .filter(p -> p.getEndDate() != null && p.getEndDate().isAfter(now))
                .count();

        //Khởi tạo dữ liệu thống kê theo năm mặc định là năm hiện tại
        int chartYear = (year != null) ? year : now.getYear();
        //Khởi tạo doanh thu 12 tháng, mặc định doanh thu mỗi tháng sẽ = 0
        Map<Integer, BigDecimal> revenueByMonth = new LinkedHashMap<>();
        for (int m = 1; m <= 12; m++) revenueByMonth.put(m, BigDecimal.ZERO);
        
        //Duyệt qua từng tháng
        allOrders.stream()
                .filter(o -> "DELIVERED".equals(o.getStatus()) //Chỉ lấy những đơn hàng đã được giao
                        && o.getOrderDate() != null
                        && o.getOrderDate().getYear() == chartYear) //Thuộc năm đó để vẽ biểu đồ
                .forEach(o -> {
                    int m = o.getOrderDate().getMonthValue(); //Lấy giá trị tháng
                    //Cộng dồn các đơn hàng theo tháng tương ứng dựa vào dữ liệu map
                    revenueByMonth.merge(m, o.getTotalAmount() != null
                            ? o.getTotalAmount() : BigDecimal.ZERO, BigDecimal::add);
                });
        //Khởi tạo map để lưu dữ liệu của 12 tháng
        Map<Integer, Long> ordersByMonth = new LinkedHashMap<>();
        for (int m = 1; m <= 12; m++) ordersByMonth.put(m, 0L);

        allOrders.stream()
                .filter(o -> o.getOrderDate() != null
                        && o.getOrderDate().getYear() == chartYear)
                .forEach(o -> {
                    int m = o.getOrderDate().getMonthValue();
                    //Cộng đơn hàng thêm 1 đơn vị(Có nghĩa là nếu trước đó là 0 sau đó là 5 thì cộng dồn)
                    ordersByMonth.merge(m, 1L, Long::sum); 
                });
        //Tạo thống kê 5 sản phẩm bán chạy nhất
        Map<String, Long> productSales = new LinkedHashMap<>(); //Lưu trữ số lượng tên của sản phẩm đã bán
        filtered.stream()
                .filter(o -> !"CANCELLED".equals(o.getStatus()) && o.getItems() != null) //Bỏ qua các đơn hàng đã huỷ
                .flatMap(o -> o.getItems().stream()) //Duyệt dữ liệu trực tiếp chi tiết món hàng
                .forEach(item -> {
                    //Lấy tên sản phẩm nếu không có thì lấy ID của sản phẩm
                    String name = item.getProductName() != null ? item.getProductName() : "SP #" + item.getProductId();
                    //sử dụng merge để cộng dồn số lượng client đã mua đc lưu trong map
                    productSales.merge(name, (long) (item.getQuantity() != null ? item.getQuantity() : 0), Long::sum);
                });
        //Tạo 1 danh sách sản phẩm theo số lượng bán giảm dần
        List<Map<String, Object>> topProducts = productSales.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed()) //Sắp xếp giảm dần
                .limit(5) //Lấy 5 sản phẩm đầu tiên
                .map(e -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("name", e.getKey()); //Tên sản phẩm
                    m.put("sold", e.getValue()); //Số lượng sp đã bán
                    return m;
                })
                .collect(Collectors.toList());
        //Đóng gọi dữ liệu bằng map trả về cho phía FE
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalRevenue", totalRevenue); //Tổng doanh thu
        result.put("totalOrders", totalOrders); //Tổng số lượng đơn hàng
        result.put("pendingOrders", pendingOrders); //Tổng số lượng đơn chờ duyệt
        result.put("cancelledOrders", cancelledOrders); //Đơn hàng huỷ
        result.put("totalProducts", totalProducts); //Số lượng sp
        result.put("totalUsers", totalUsers); //Tổng thành viên
        result.put("activePromos", activePromos); //Khuyến mãi hoạt động
        result.put("revenueByMonth", revenueByMonth); //Doanh thu 12 tháng
        result.put("ordersByMonth", ordersByMonth);// Số đơn của 12 tháng
        result.put("topProducts", topProducts);// sản phẩm bán chạy
        result.put("chartYear", chartYear);// theo năm

        return ResponseEntity.ok(result);
    }
}