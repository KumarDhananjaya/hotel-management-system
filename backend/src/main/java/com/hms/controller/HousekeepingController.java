package com.hms.controller;

import com.hms.model.HousekeepingTask;
import com.hms.model.MaintenanceLog;
import com.hms.service.HousekeepingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/housekeeping")
public class HousekeepingController {

    @Autowired
    private HousekeepingService housekeepingService;

    // Tasks
    @GetMapping("/tasks")
    public List<HousekeepingTask> getAllTasks() {
        return housekeepingService.getAllTasks();
    }

    @PostMapping("/tasks")
    public ResponseEntity<?> assignTask(@RequestBody HousekeepingTask task) {
        try {
            return ResponseEntity.ok(housekeepingService.assignTask(task));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/tasks/{id}/status")
    public ResponseEntity<?> updateTaskStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        try {
            HousekeepingTask.TaskStatus status = HousekeepingTask.TaskStatus.valueOf(payload.get("status"));
            return ResponseEntity.ok(housekeepingService.updateTaskStatus(id, status));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Maintenance
    @GetMapping("/maintenance")
    public List<MaintenanceLog> getAllMaintenanceLogs() {
        return housekeepingService.getAllMaintenanceLogs();
    }

    @PostMapping("/maintenance")
    public ResponseEntity<?> reportIssue(@RequestBody MaintenanceLog log) {
        try {
            return ResponseEntity.ok(housekeepingService.reportIssue(log));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/maintenance/{id}/resolve")
    public ResponseEntity<?> resolveIssue(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(housekeepingService.resolveIssue(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/tasks/{id}")
    public ResponseEntity<?> updateTask(@PathVariable Long id, @RequestBody HousekeepingTask task) {
        try {
            return ResponseEntity.ok(housekeepingService.updateTask(id, task));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/tasks/{id}")
    public ResponseEntity<?> deleteTask(@PathVariable Long id) {
        try {
            housekeepingService.deleteTask(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/maintenance/{id}")
    public ResponseEntity<?> updateMaintenanceLog(@PathVariable Long id, @RequestBody MaintenanceLog log) {
        try {
            return ResponseEntity.ok(housekeepingService.updateMaintenanceLog(id, log));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/maintenance/{id}")
    public ResponseEntity<?> deleteMaintenanceLog(@PathVariable Long id) {
        try {
            housekeepingService.deleteMaintenanceLog(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
