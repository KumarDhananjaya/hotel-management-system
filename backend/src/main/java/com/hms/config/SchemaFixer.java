package com.hms.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@Order(1) // Run before DataSeeder
public class SchemaFixer implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        try {
            // Drop the constraint that restricts role values.
            // Hibernate will either recreate it or we can live without it for now.
            // The issue is that the old constraint only allows ADMIN, STAFF.
            jdbcTemplate.execute("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check");
            System.out.println("Successfully dropped users_role_check constraint.");
        } catch (Exception e) {
            System.out.println(
                    "Failed to drop users_role_check constraint (might not exist or other error): " + e.getMessage());
        }

        try {
            // Drop the constraint that restricts room status values.
            // The old constraint doesn't include CLEANING status.
            jdbcTemplate.execute("ALTER TABLE rooms DROP CONSTRAINT IF EXISTS rooms_status_check");
            System.out.println("Successfully dropped rooms_status_check constraint.");
        } catch (Exception e) {
            System.out.println(
                    "Failed to drop rooms_status_check constraint (might not exist or other error): " + e.getMessage());
        }

        try {
            // Drop the constraint that restricts room type values.
            // The old constraint might not include DORMITORY.
            jdbcTemplate.execute("ALTER TABLE rooms DROP CONSTRAINT IF EXISTS rooms_type_check");
            System.out.println("Successfully dropped rooms_type_check constraint.");
        } catch (Exception e) {
            System.out.println(
                    "Failed to drop rooms_type_check constraint (might not exist or other error): " + e.getMessage());
        }
    }
}
