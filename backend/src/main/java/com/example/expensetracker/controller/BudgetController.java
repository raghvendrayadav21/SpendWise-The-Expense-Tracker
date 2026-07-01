package com.example.expensetracker.controller;

import com.example.expensetracker.model.Budget;
import com.example.expensetracker.repository.BudgetRepository;
import com.example.expensetracker.security.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    @Autowired
    private BudgetRepository budgetRepository;

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userDetails.getId();
    }

    @PostMapping
    public ResponseEntity<Budget> createOrUpdateBudget(@Valid @RequestBody Budget budget) {
        Long userId = getCurrentUserId();
        budget.setUserId(userId);

        // If a budget already exists for this category, update it instead of creating a duplicate
        Optional<Budget> existingBudget = budgetRepository.findByUserIdAndCategory(userId, budget.getCategory());
        if (existingBudget.isPresent()) {
            Budget budgetToUpdate = existingBudget.get();
            budgetToUpdate.setMonthlyLimit(budget.getMonthlyLimit());
            Budget savedBudget = budgetRepository.save(budgetToUpdate);
            return ResponseEntity.ok(savedBudget);
        }

        Budget savedBudget = budgetRepository.save(budget);
        return ResponseEntity.ok(savedBudget);
    }

    @GetMapping
    public ResponseEntity<List<Budget>> getAllBudgets() {
        List<Budget> budgets = budgetRepository.findByUserId(getCurrentUserId());
        return ResponseEntity.ok(budgets);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateBudget(@PathVariable Long id, @Valid @RequestBody Budget budgetDetails) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget not found with id: " + id));

        if (!budget.getUserId().equals(getCurrentUserId())) {
            return ResponseEntity.status(403).body("Error: Forbidden access to this resource");
        }

        budget.setMonthlyLimit(budgetDetails.getMonthlyLimit());
        budget.setCategory(budgetDetails.getCategory());

        Budget updatedBudget = budgetRepository.save(budget);
        return ResponseEntity.ok(updatedBudget);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBudget(@PathVariable Long id) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget not found with id: " + id));

        if (!budget.getUserId().equals(getCurrentUserId())) {
            return ResponseEntity.status(403).body("Error: Forbidden access to this resource");
        }

        budgetRepository.delete(budget);
        return ResponseEntity.ok("Budget deleted successfully");
    }
}
