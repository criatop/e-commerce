package cl.ecommerce.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesSummary {

    private double totalSales;
    private long totalOrders;
    private double averageOrderValue;
    private List<CategorySales> topCategories;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategorySales {
        private String category;
        private double total;
    }
}
