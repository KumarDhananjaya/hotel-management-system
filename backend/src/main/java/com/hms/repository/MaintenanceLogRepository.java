package com.hms.repository;

import com.hms.model.MaintenanceLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MaintenanceLogRepository extends JpaRepository<MaintenanceLog, Long> {
    List<MaintenanceLog> findByStatus(MaintenanceLog.MaintenanceStatus status);

    List<MaintenanceLog> findAllByOrderByReportedAtDesc();
}
