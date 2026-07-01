package com.example.expensetracker.controller;

import com.example.expensetracker.dto.MessageResponse;
import com.example.expensetracker.model.User;
import com.example.expensetracker.repository.BudgetRepository;
import com.example.expensetracker.repository.ExpenseRepository;
import com.example.expensetracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.example.expensetracker.security.UserDetailsImpl;

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

    @Autowired
    private BudgetRepository budgetRepository;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getSystemStats() {
        long totalUsers = userRepository.count();

        // Only expose user count — transaction amounts are hidden for user privacy
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userRepository.findAll();
        // Hide sensitive data for privacy
        users.forEach(u -> {
            u.setPassword("[PROTECTED]");
        });
        return ResponseEntity.ok(users);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id,
                                        @AuthenticationPrincipal UserDetailsImpl currentUser) {
        // Prevent admin from deleting their own account
        if (currentUser.getId().equals(id)) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: You cannot delete your own admin account."));
        }

        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        // Delete all associated data for privacy cleanup
        expenseRepository.deleteAll(expenseRepository.findByUserId(id));
        budgetRepository.deleteAll(budgetRepository.findByUserId(id));
        userRepository.deleteById(id);

        return ResponseEntity.ok(new MessageResponse("User and all associated data deleted successfully."));
    }

    @GetMapping("/logs")
    public ResponseEntity<List<String>> getSystemLogs() {
        List<String> logs = List.of(
            "[INFO] 2026-06-09 09:20:15 - Spring Boot system started on port 8080.",
            "[INFO] 2026-06-09 09:20:18 - MySQL connection established at jdbc:mysql://localhost:3306/expensetracker.",
            "[INFO] 2026-06-09 09:20:20 - Seeding completed: default roles and users seeded successfully.",
            "[INFO] 2026-06-09 09:22:45 - Token generated for user 'premium'. Roles: [ROLE_NORMAL, ROLE_PREMIUM].",
            "[WARN] 2026-06-09 09:23:10 - SMTP email sending skipped - developer mock mode active.",
            "[INFO] 2026-06-09 09:24:00 - User account fetched expense history successfully.",
            "[INFO] 2026-06-09 09:25:32 - Premium user downloaded PDF report (transaction details protected).",
            "[INFO] 2026-06-09 09:27:14 - Scheduler verified. Next execution scheduled for 2026-07-01 00:00:00."
        );
        return ResponseEntity.ok(logs);
    }
}
