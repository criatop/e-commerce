package cl.ecommerce.analytics.repository;

import cl.ecommerce.analytics.model.UserActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface UserActivityRepository extends JpaRepository<UserActivity, java.util.UUID> {

    List<UserActivity> findByUserId(String userId);

    List<UserActivity> findByAction(UserActivity.Action action);

    List<UserActivity> findByRecordedAtBetween(LocalDateTime from, LocalDateTime to);

    @Query("SELECT COUNT(DISTINCT u.userId) FROM UserActivity u")
    long countDistinctUsers();

    @Query("SELECT COUNT(u) FROM UserActivity u WHERE u.action = :action")
    long countByAction(@Param("action") UserActivity.Action action);
}
