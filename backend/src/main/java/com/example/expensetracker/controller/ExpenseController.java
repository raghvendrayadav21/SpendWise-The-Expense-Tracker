package com.example.expensetracker.controller;

import com.example.expensetracker.model.Expense;
import com.example.expensetracker.repository.ExpenseRepository;
import com.example.expensetracker.security.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    @Autowired
    private ExpenseRepository expenseRepository;

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userDetails.getId();
    }

    @PostMapping
    public ResponseEntity<Expense> createExpense(@Valid @RequestBody Expense expense) {
        expense.setUserId(getCurrentUserId());
        Expense savedExpense = expenseRepository.save(expense);
        return ResponseEntity.ok(savedExpense);
    }

    @GetMapping
    public ResponseEntity<List<Expense>> getAllExpenses() {
        List<Expense> expenses = expenseRepository.findByUserId(getCurrentUserId());
        return ResponseEntity.ok(expenses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getExpenseById(@PathVariable Long id) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found with id: " + id));

        if (!expense.getUserId().equals(getCurrentUserId())) {
            return ResponseEntity.status(403).body("Error: Forbidden access to this resource");
        }

        return ResponseEntity.ok(expense);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateExpense(@PathVariable Long id, @Valid @RequestBody Expense expenseDetails) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found with id: " + id));

        if (!expense.getUserId().equals(getCurrentUserId())) {
            return ResponseEntity.status(403).body("Error: Forbidden access to this resource");
        }

        expense.setAmount(expenseDetails.getAmount());
        expense.setCategory(expenseDetails.getCategory());
        expense.setDate(expenseDetails.getDate());
        expense.setDescription(expenseDetails.getDescription());

        Expense updatedExpense = expenseRepository.save(expense);
        return ResponseEntity.ok(updatedExpense);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteExpense(@PathVariable Long id) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found with id: " + id));

        if (!expense.getUserId().equals(getCurrentUserId())) {
            return ResponseEntity.status(403).body("Error: Forbidden access to this resource");
        }

        expenseRepository.delete(expense);
        return ResponseEntity.ok("Expense deleted successfully");
    }

    @GetMapping("/range")
    public ResponseEntity<List<Expense>> getExpensesByRange(
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        // JPA Between is inclusive on both ends, no +1 day workaround needed
        List<Expense> expenses = expenseRepository.findByUserIdAndDateBetween(getCurrentUserId(), startDate, endDate);
        return ResponseEntity.ok(expenses);
    }
}
