package com.hms.config;

import com.hms.model.User;
import com.hms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        seedUser("admin@hms.com", "admin123", "Admin User", User.Role.ADMIN);
        seedUser("manager@hms.com", "manager123", "Manager User", User.Role.MANAGER);
        seedUser("reception@hms.com", "reception123", "Receptionist User", User.Role.RECEPTIONIST);
        seedUser("housekeeping@hms.com", "housekeeping123", "Housekeeping User", User.Role.HOUSEKEEPING);
    }

    private void seedUser(String email, String password, String name, User.Role role) {
        if (!userRepository.existsByEmail(email)) {
            User user = new User();
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(password));
            user.setName(name);
            user.setRole(role);
            userRepository.save(user);
            System.out.println("Seeded user: " + email);
        }
    }
}
