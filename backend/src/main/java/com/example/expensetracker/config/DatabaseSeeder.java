package com.example.expensetracker.config;

import com.example.expensetracker.model.Budget;
import com.example.expensetracker.model.Expense;
import com.example.expensetracker.model.User;
import com.example.expensetracker.repository.BudgetRepository;
import com.example.expensetracker.repository.ExpenseRepository;
import com.example.expensetracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Only seed if no users exist — preserves real user data across restarts
        if (userRepository.count() > 0) {
            System.out.println("Database Seeding: Data already exists, skipping seed.");
            return;
        }
            // Seed Admin User
            User admin = User.builder()
                    .username("admin")
                    .email("admin@expensetracker.com")
                    .password(passwordEncoder.encode("admin123"))
                    .roles(new HashSet<>(Arrays.asList("ROLE_NORMAL", "ROLE_PREMIUM", "ROLE_ADMIN")))
                    .profileUpdated(true)
                    .build();
            userRepository.save(admin);

            // Seed Premium User
            User premium = User.builder()
                    .username("premium")
                    .email("premium@expensetracker.com")
                    .password(passwordEncoder.encode("premium123"))
                    .roles(new HashSet<>(Arrays.asList("ROLE_NORMAL", "ROLE_PREMIUM")))
                    .build();
            premium = userRepository.save(premium);

            // Seed Normal User
            User normal = User.builder()
                    .username("user")
                    .email("user@expensetracker.com")
                    .password(passwordEncoder.encode("user123"))
                    .roles(new HashSet<>(Collections.singletonList("ROLE_NORMAL")))
                    .build();
            normal = userRepository.save(normal);

            System.out.println("Database Seeding: Saved Admin, Premium, and Normal Users.");

            // Seed sample budgets for premium user (userId is now Long, auto-assigned by MySQL)
            Budget b1 = Budget.builder().userId(premium.getId()).category("Food").monthlyLimit(500.0).build();
            Budget b2 = Budget.builder().userId(premium.getId()).category("Rent").monthlyLimit(1200.0).build();
            Budget b3 = Budget.builder().userId(premium.getId()).category("Utilities").monthlyLimit(300.0).build();
            Budget b4 = Budget.builder().userId(premium.getId()).category("Entertainment").monthlyLimit(200.0).build();
            budgetRepository.saveAll(Arrays.asList(b1, b2, b3, b4));

            // Seed sample budgets for normal user
            Budget nb1 = Budget.builder().userId(normal.getId()).category("Food").monthlyLimit(500.0).build();
            Budget nb2 = Budget.builder().userId(normal.getId()).category("Rent").monthlyLimit(1200.0).build();
            Budget nb3 = Budget.builder().userId(normal.getId()).category("Utilities").monthlyLimit(300.0).build();
            Budget nb4 = Budget.builder().userId(normal.getId()).category("Entertainment").monthlyLimit(200.0).build();
            budgetRepository.saveAll(Arrays.asList(nb1, nb2, nb3, nb4));

            // Seed sample expenses for premium user
            LocalDate today = LocalDate.now();
            Expense e1 = Expense.builder().userId(premium.getId()).amount(45.50).category("Food").date(today.minusDays(2)).description("Groceries at Walmart").build();
            Expense e2 = Expense.builder().userId(premium.getId()).amount(1200.0).category("Rent").date(today.withDayOfMonth(1)).description("Monthly Rent").build();
            Expense e3 = Expense.builder().userId(premium.getId()).amount(85.20).category("Utilities").date(today.minusDays(5)).description("Electricity Bill").build();
            Expense e4 = Expense.builder().userId(premium.getId()).amount(55.0).category("Entertainment").date(today.minusDays(1)).description("Movie tickets and snacks").build();
            Expense e5 = Expense.builder().userId(premium.getId()).amount(120.00).category("Food").date(today.minusDays(4)).description("Dinner with friends").build();
            Expense e6 = Expense.builder().userId(premium.getId()).amount(35.00).category("Travel").date(today.minusDays(10)).description("Gas filling").build();

            // Over budget expense category Food to trigger AI recommendation
            Expense e7 = Expense.builder().userId(premium.getId()).amount(380.00).category("Food").date(today.minusDays(3)).description("Fine dining & wholesale warehouse grocery run").build();

            // Seed sample expenses for normal user
            Expense ne1 = Expense.builder().userId(normal.getId()).amount(45.50).category("Food").date(today.minusDays(2)).description("Groceries at Walmart").build();
            Expense ne2 = Expense.builder().userId(normal.getId()).amount(1200.0).category("Rent").date(today.withDayOfMonth(1)).description("Monthly Rent").build();
            Expense ne3 = Expense.builder().userId(normal.getId()).amount(85.20).category("Utilities").date(today.minusDays(5)).description("Electricity Bill").build();
            Expense ne4 = Expense.builder().userId(normal.getId()).amount(55.0).category("Entertainment").date(today.minusDays(1)).description("Movie tickets and snacks").build();
            Expense ne5 = Expense.builder().userId(normal.getId()).amount(120.00).category("Food").date(today.minusDays(4)).description("Dinner with friends").build();
            Expense ne6 = Expense.builder().userId(normal.getId()).amount(35.00).category("Travel").date(today.minusDays(10)).description("Gas filling").build();
            Expense ne7 = Expense.builder().userId(normal.getId()).amount(380.00).category("Food").date(today.minusDays(3)).description("Fine dining & wholesale warehouse grocery run").build();

            expenseRepository.saveAll(Arrays.asList(e1, e2, e3, e4, e5, e6, e7, ne1, ne2, ne3, ne4, ne5, ne6, ne7));
            System.out.println("Database Seeding: Saved sample expenses and budgets for both users.");
    }
}
