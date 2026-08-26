package cl.ecommerce.analytics.dto;

import cl.ecommerce.analytics.model.SalesRecord;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {

    private double totalRevenue;
    private long totalOrders;
    private long totalUsers;
    private double averageOrderValue;
    private List<SalesRecord> recentOrders;
}
