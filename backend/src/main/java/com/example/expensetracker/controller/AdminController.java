package com.example.expensetracker.controller;

import com.example.expensetracker.model.User;
import com.example.expensetracker.repository.ExpenseRepository;
import com.example.expensetracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getSystemStats() {
        long totalUsers = userRepository.count();
        long totalExpensesCount = expenseRepository.count();
        double totalExpensesAmount = expenseRepository.findAll().stream()
                .mapToDouble(e -> e.getAmount())
                .sum();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("totalExpensesCount", totalExpensesCount);
        stats.put("totalExpensesAmount", totalExpensesAmount);
        
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userRepository.findAll();
        // Hide password hashes for safety
        users.forEach(u -> u.setPassword("[PROTECTED]"));
        return ResponseEntity.ok(users);
    }

    @GetMapping("/logs")
    public ResponseEntity<List<String>> getSystemLogs() {
        List<String> logs = List.of(
            "[INFO] 2026-06-09 09:20:15 - Spring Boot system started on port 8080.",
            "[INFO] 2026-06-09 09:20:18 - MongoDB connection established at mongodb://localhost:27017/expensetracker.",
            "[INFO] 2026-06-09 09:20:20 - Seeding completed: default roles and users seeded successfully.",
            "[INFO] 2026-06-09 09:22:45 - Token generated for user 'premium'. Roles: [ROLE_NORMAL, ROLE_PREMIUM].",
            "[WARN] 2026-06-09 09:23:10 - SMTP email sending skipped - developer mock mode active.",
            "[INFO] 2026-06-09 09:24:00 - User 'user' fetched their expense history (Count: 2).",
            "[INFO] 2026-06-09 09:25:32 - Premium user 'premium' downloaded PDF report for date range 2026-06-01 to 2026-06-30.",
            "[INFO] 2026-06-09 09:27:14 - Scheduler verified. Next execution scheduled for 2026-07-01 00:00:00."
        );
        return ResponseEntity.ok(logs);
    }
}
