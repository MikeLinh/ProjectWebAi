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

    @Autowired private OrderRepository       orderRepository;
    @Autowired private ProductRepository     productRepository;
    @Autowired private PromotionRepository   promotionRepository;
    @Autowired private UserRepository        userRepository;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {

        var allOrders = orderRepository.findAll();

        var filtered = allOrders.stream().filter(o -> {
            if (o.getOrderDate() == null) return false;
            boolean matchYear  = (year  == null || o.getOrderDate().getYear()        == year);
            boolean matchMonth = (month == null || o.getOrderDate().getMonthValue()  == month);
            return matchYear && matchMonth;
        }).toList();
        BigDecimal totalRevenue = filtered.stream()
                .filter(o -> "DELIVERED".equals(o.getStatus()))
                .map(o -> o.getTotalAmount() != null ? o.getTotalAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long pendingOrders = filtered.stream()
                .filter(o -> "PENDING".equals(o.getStatus())).count();

        long totalOrders = filtered.size();

        long cancelledOrders = filtered.stream()
                .filter(o -> "CANCELLED".equals(o.getStatus())).count();

        // Sản phẩm, user, khuyến mãi đang chạy (không lọc theo tháng)
        long totalProducts = productRepository.count();
        long totalUsers    = userRepository.count();

        LocalDateTime now = LocalDateTime.now();
        long activePromos = promotionRepository.findAll().stream()
                .filter(p -> p.getEndDate() != null && p.getEndDate().isAfter(now))
                .count();

        int chartYear = (year != null) ? year : now.getYear();
        Map<Integer, BigDecimal> revenueByMonth = new LinkedHashMap<>();
        for (int m = 1; m <= 12; m++) revenueByMonth.put(m, BigDecimal.ZERO);

        allOrders.stream()
                .filter(o -> "DELIVERED".equals(o.getStatus())
                        && o.getOrderDate() != null
                        && o.getOrderDate().getYear() == chartYear)
                .forEach(o -> {
                    int m = o.getOrderDate().getMonthValue();
                    revenueByMonth.merge(m, o.getTotalAmount() != null
                            ? o.getTotalAmount() : BigDecimal.ZERO, BigDecimal::add);
                });

        Map<Integer, Long> ordersByMonth = new LinkedHashMap<>();
        for (int m = 1; m <= 12; m++) ordersByMonth.put(m, 0L);

        allOrders.stream()
                .filter(o -> o.getOrderDate() != null
                        && o.getOrderDate().getYear() == chartYear)
                .forEach(o -> {
                    int m = o.getOrderDate().getMonthValue();
                    ordersByMonth.merge(m, 1L, Long::sum);
                });

        Map<String, Long> productSales = new LinkedHashMap<>();
        filtered.stream()
                .filter(o -> !"CANCELLED".equals(o.getStatus()) && o.getItems() != null)
                .flatMap(o -> o.getItems().stream())
                .forEach(item -> {
                    String name = item.getProductName() != null ? item.getProductName() : "SP #" + item.getProductId();
                    productSales.merge(name, (long) (item.getQuantity() != null ? item.getQuantity() : 0), Long::sum);
                });

        List<Map<String, Object>> topProducts = productSales.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .map(e -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("name", e.getKey());
                    m.put("sold", e.getValue());
                    return m;
                })
                .collect(Collectors.toList());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalRevenue",    totalRevenue);
        result.put("totalOrders",     totalOrders);
        result.put("pendingOrders",   pendingOrders);
        result.put("cancelledOrders", cancelledOrders);
        result.put("totalProducts",   totalProducts);
        result.put("totalUsers",      totalUsers);
        result.put("activePromos",    activePromos);
        result.put("revenueByMonth",  revenueByMonth);
        result.put("ordersByMonth",   ordersByMonth);
        result.put("topProducts",     topProducts);
        result.put("chartYear",       chartYear);

        return ResponseEntity.ok(result);
    }
}