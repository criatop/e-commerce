package cl.ecommerce.notification.controller;

import cl.ecommerce.common.dto.ApiResponse;
import cl.ecommerce.notification.dto.NotificationRequest;
import cl.ecommerce.notification.dto.NotificationResponse;
import cl.ecommerce.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping
    public ResponseEntity<ApiResponse<NotificationResponse>> sendNotification(
            @RequestBody NotificationRequest request) {
        NotificationResponse response = notificationService.sendNotification(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(response, "Notification sent successfully"));
    }

    @GetMapping("/user/{email}")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getNotificationsByUser(
            @PathVariable String email) {
        List<NotificationResponse> notifications = notificationService.getNotificationsByUser(email);
        return ResponseEntity.ok(ApiResponse.ok(notifications, "Notifications retrieved successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getAllNotifications() {
        List<NotificationResponse> notifications = notificationService.getAll();
        return ResponseEntity.ok(ApiResponse.ok(notifications, "All notifications retrieved successfully"));
    }
}
