package com.hms.repository;

import com.hms.model.HousekeepingTask;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface HousekeepingTaskRepository extends JpaRepository<HousekeepingTask, Long> {
    List<HousekeepingTask> findByAssignedStaffId(Long staffId);

    List<HousekeepingTask> findByStatus(HousekeepingTask.TaskStatus status);

    List<HousekeepingTask> findAllByOrderByScheduledDateDesc();
}
