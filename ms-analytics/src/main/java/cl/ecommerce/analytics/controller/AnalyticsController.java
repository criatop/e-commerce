package cl.ecommerce.analytics.controller;

import cl.ecommerce.analytics.dto.DashboardResponse;
import cl.ecommerce.analytics.dto.SalesSummary;
import cl.ecommerce.analytics.model.SalesRecord;
import cl.ecommerce.analytics.model.UserActivity;
import cl.ecommerce.analytics.service.AnalyticsService;
import cl.ecommerce.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard() {
        DashboardResponse dashboard = analyticsService.getDashboard();
        return ResponseEntity.ok(ApiResponse.ok(dashboard));
    }

    @GetMapping("/sales")
    public ResponseEntity<ApiResponse<SalesSummary>> getSales(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        SalesSummary summary = analyticsService.getSalesSummary(from, to);
        return ResponseEntity.ok(ApiResponse.ok(summary));
    }

    @GetMapping("/top-products")
    public ResponseEntity<ApiResponse<List<SalesRecord>>> getTopProducts() {
        List<SalesRecord> topProducts = analyticsService.getTopProducts();
        return ResponseEntity.ok(ApiResponse.ok(topProducts));
    }

    @GetMapping("/user/{userId}/activity")
    public ResponseEntity<ApiResponse<List<UserActivity>>> getUserActivity(@PathVariable String userId) {
        List<UserActivity> activities = analyticsService.getUserActivity(userId);
        return ResponseEntity.ok(ApiResponse.ok(activities));
    }
}
