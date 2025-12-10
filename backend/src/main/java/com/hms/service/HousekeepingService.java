package com.hms.service;

import com.hms.model.HousekeepingTask;
import com.hms.model.MaintenanceLog;
import com.hms.model.Room;
import com.hms.model.User;
import com.hms.repository.HousekeepingTaskRepository;
import com.hms.repository.MaintenanceLogRepository;
import com.hms.repository.RoomRepository;
import com.hms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class HousekeepingService {

    @Autowired
    private HousekeepingTaskRepository taskRepository;

    @Autowired
    private MaintenanceLogRepository maintenanceRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private UserRepository userRepository;

    // Task Management
    public List<HousekeepingTask> getAllTasks() {
        return taskRepository.findAllByOrderByScheduledDateDesc();
    }

    public HousekeepingTask assignTask(HousekeepingTask task) {
        Room room = roomRepository.findById(task.getRoom().getId())
                .orElseThrow(() -> new RuntimeException("Room not found"));

        if (task.getAssignedStaff() != null && task.getAssignedStaff().getId() != null) {
            User staff = userRepository.findById(task.getAssignedStaff().getId())
                    .orElseThrow(() -> new RuntimeException("Staff not found"));
            task.setAssignedStaff(staff);
        }

        task.setRoom(room);
        task.setStatus(HousekeepingTask.TaskStatus.PENDING);

        // Update room status to CLEANING if applicable
        room.setStatus(Room.RoomStatus.CLEANING);
        roomRepository.save(room);

        return taskRepository.save(task);
    }

    public HousekeepingTask updateTaskStatus(Long id, HousekeepingTask.TaskStatus status) {
        HousekeepingTask task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        task.setStatus(status);
        if (status == HousekeepingTask.TaskStatus.COMPLETED) {
            task.setCompletedAt(LocalDateTime.now());
            // Set room back to AVAILABLE
            Room room = task.getRoom();
            room.setStatus(Room.RoomStatus.AVAILABLE);
            roomRepository.save(room);
        }
        return taskRepository.save(task);
    }

    public HousekeepingTask updateTask(Long id, HousekeepingTask taskDetails) {
        HousekeepingTask task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        task.setScheduledDate(taskDetails.getScheduledDate());
        task.setDescription(taskDetails.getDescription());

        if (taskDetails.getAssignedStaff() != null) {
            User staff = userRepository.findById(taskDetails.getAssignedStaff().getId())
                    .orElseThrow(() -> new RuntimeException("Staff not found"));
            task.setAssignedStaff(staff);
        }

        return taskRepository.save(task);
    }

    public void deleteTask(Long id) {
        if (!taskRepository.existsById(id)) {
            throw new RuntimeException("Task not found");
        }
        taskRepository.deleteById(id);
    }

    // Maintenance Management
    public List<MaintenanceLog> getAllMaintenanceLogs() {
        return maintenanceRepository.findAllByOrderByReportedAtDesc();
    }

    public MaintenanceLog reportIssue(MaintenanceLog log) {
        Room room = roomRepository.findById(log.getRoom().getId())
                .orElseThrow(() -> new RuntimeException("Room not found"));

        log.setRoom(room);
        room.setStatus(Room.RoomStatus.MAINTENANCE);
        roomRepository.save(room);

        return maintenanceRepository.save(log);
    }

    public MaintenanceLog resolveIssue(Long id) {
        MaintenanceLog log = maintenanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Log not found"));

        log.setStatus(MaintenanceLog.MaintenanceStatus.RESOLVED);
        log.setResolvedAt(LocalDateTime.now());

        Room room = log.getRoom();
        room.setStatus(Room.RoomStatus.AVAILABLE);
        roomRepository.save(room);

        return maintenanceRepository.save(log);
    }

    public MaintenanceLog updateMaintenanceLog(Long id, MaintenanceLog logDetails) {
        MaintenanceLog log = maintenanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Log not found"));

        log.setIssue(logDetails.getIssue());

        return maintenanceRepository.save(log);
    }

    public void deleteMaintenanceLog(Long id) {
        if (!maintenanceRepository.existsById(id)) {
            throw new RuntimeException("Log not found");
        }
        maintenanceRepository.deleteById(id);
    }
}
