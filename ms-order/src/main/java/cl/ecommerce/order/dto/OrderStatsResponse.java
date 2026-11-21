package cl.ecommerce.order.dto;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public record OrderStatsResponse(
        double totalSales,
        long totalOrders,
        double averageTicket,
        Map<String, Long> ordersByStatus,
        List<TopProduct> topProducts
) {
    public record TopProduct(UUID productId, String productName, long quantity, double amount) {}
}
