package com.hms.service;

import com.hms.model.ActivityLog;
import com.hms.model.User;
import com.hms.repository.ActivityLogRepository;
import com.hms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ActivityLogService {

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private UserRepository userRepository;

    public void logActivity(String action, String details) {
        try {
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            String email;
            if (principal instanceof UserDetails) {
                email = ((UserDetails) principal).getUsername();
            } else {
                email = principal.toString();
            }

            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            ActivityLog log = new ActivityLog(user, action, details);
            activityLogRepository.save(log);
        } catch (Exception e) {
            // Silently fail logging if user not found or system action
            System.err.println("Failed to log activity: " + e.getMessage());
        }
    }

    public List<ActivityLog> getAllLogs() {
        return activityLogRepository.findAllByOrderByTimestampDesc();
    }
}
