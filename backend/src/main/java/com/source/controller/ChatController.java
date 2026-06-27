package com.source.controller;

import com.source.model.Product;
import com.source.model.Promotion;
import com.source.repository.ProductRepository;
import com.source.repository.PromotionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "http://localhost:5173")
public class ChatController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private PromotionRepository promotionRepository;
    @GetMapping("/context")
    public ResponseEntity<String> getAIContext() {
        List<Product> products = productRepository.findAll();
        String productContext = products.stream().map(p ->
            String.format("- %s | Hãng: %s | Danh mục: %s | Giá: $%s | Tồn kho: %d xe | Mô tả: %s",
                p.getProductName(),
                p.getBrand() != null ? p.getBrand() : "N/A",
                p.getCategory() != null ? p.getCategory().getCategoryName() : "N/A",
                p.getPrice().toPlainString(),
                p.getStockQuantity() != null ? p.getStockQuantity() : 0,
                p.getDescription() != null ? p.getDescription() : ""
            )
        ).collect(Collectors.joining("\n"));

        LocalDateTime now = LocalDateTime.now();
        List<Promotion> activePromos = promotionRepository.findAll().stream()
            .filter(p -> p.getEndDate() != null && p.getEndDate().isAfter(now))
            .filter(p -> p.getStartDate() == null || p.getStartDate().isBefore(now))
            .collect(Collectors.toList());

        String promoContext = activePromos.isEmpty()
            ? "Hiện không có mã khuyến mãi nào đang chạy."
            : activePromos.stream().map(p ->
                String.format("- Mã: %s | Giảm: $%s | Hạn dùng đến: %s",
                    p.getCouponCode(),
                    p.getDiscountValue().toPlainString(),
                    p.getEndDate().toLocalDate().toString()
                )
            ).collect(Collectors.joining("\n"));

        String context = """
                Bạn là trợ lý AI thông minh của BIKECYC STORE — cửa hàng xe đạp cao cấp.
                Hãy tư vấn nhiệt tình, ngắn gọn, dùng thông tin thực tế dưới đây.
                Nếu khách hỏi sản phẩm không có trong danh sách, hãy khéo léo giới thiệu mẫu phù hợp nhất.

                === DANH SÁCH SẢN PHẨM HIỆN TẠI ===
                %s

                === MÃ KHUYẾN MÃI ĐANG HOẠT ĐỘNG ===
                %s
                """.formatted(productContext, promoContext);

        return ResponseEntity.ok(context);
    }
}