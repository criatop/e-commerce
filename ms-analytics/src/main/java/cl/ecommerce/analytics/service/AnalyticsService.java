package cl.ecommerce.analytics.service;

import cl.ecommerce.analytics.dto.DashboardResponse;
import cl.ecommerce.analytics.dto.SalesSummary;
import cl.ecommerce.analytics.model.SalesRecord;
import cl.ecommerce.analytics.model.UserActivity;
import cl.ecommerce.analytics.repository.SalesRecordRepository;
import cl.ecommerce.analytics.repository.UserActivityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsService {

    private final SalesRecordRepository salesRecordRepository;
    private final UserActivityRepository userActivityRepository;

    public SalesRecord recordSale(SalesRecord sale) {
        log.info("Recording sale for order: {}", sale.getOrderId());
        return salesRecordRepository.save(sale);
    }

    public UserActivity recordActivity(UserActivity activity) {
        log.info("Recording activity: {} for user: {}", activity.getAction(), activity.getUserId());
        return userActivityRepository.save(activity);
    }

    public SalesSummary getSalesSummary(LocalDateTime from, LocalDateTime to) {
        List<SalesRecord> records;
        if (from != null && to != null) {
            records = salesRecordRepository.findByRecordedAtBetween(from, to);
        } else {
            records = salesRecordRepository.findAll();
        }

        double totalSales = records.stream().mapToDouble(SalesRecord::getAmount).sum();
        long totalOrders = records.size();
        double averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

        List<Object[]> categoryData = salesRecordRepository.sumAmountGroupByCategory();
        List<SalesSummary.CategorySales> topCategories = new ArrayList<>();
        for (Object[] row : categoryData) {
            topCategories.add(SalesSummary.CategorySales.builder()
                    .category((String) row[0])
                    .total((Double) row[1])
                    .build());
        }

        return SalesSummary.builder()
                .totalSales(totalSales)
                .totalOrders(totalOrders)
                .averageOrderValue(averageOrderValue)
                .topCategories(topCategories)
                .build();
    }

    public DashboardResponse getDashboard() {
        Double revenue = salesRecordRepository.totalRevenue();
        long totalOrders = salesRecordRepository.countAll();
        long totalUsers = userActivityRepository.countDistinctUsers();
        double avgOrder = totalOrders > 0 && revenue != null ? revenue / totalOrders : 0;
        List<SalesRecord> recentOrders = salesRecordRepository
                .findAll(PageRequest.of(0, 10)).getContent();

        return DashboardResponse.builder()
                .totalRevenue(revenue != null ? revenue : 0)
                .totalOrders(totalOrders)
                .totalUsers(totalUsers)
                .averageOrderValue(avgOrder)
                .recentOrders(recentOrders)
                .build();
    }

    public List<SalesRecord> getTopProducts() {
        List<Object[]> topProducts = salesRecordRepository.topProductsByRevenue();
        List<SalesRecord> result = new ArrayList<>();
        for (Object[] row : topProducts) {
            String productId = (String) row[0];
            List<SalesRecord> records = salesRecordRepository.findByProductId(productId);
            if (!records.isEmpty()) {
                result.add(records.get(0));
            }
        }
        return result;
    }

    public List<UserActivity> getUserActivity(String userId) {
        return userActivityRepository.findByUserId(userId);
    }
}
