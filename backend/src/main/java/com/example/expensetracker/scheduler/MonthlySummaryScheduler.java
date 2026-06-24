package com.example.expensetracker.scheduler;

import com.example.expensetracker.model.Expense;
import com.example.expensetracker.model.User;
import com.example.expensetracker.repository.ExpenseRepository;
import com.example.expensetracker.repository.UserRepository;
import com.example.expensetracker.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class MonthlySummaryScheduler {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private EmailService emailService;

    // Runs at 00:00:00am on the 1st day of every month
    @Scheduled(cron = "0 0 0 1 * ?")
    public void generateMonthlySummaries() {
        LocalDate today = LocalDate.now();
        LocalDate start = today.minusMonths(1).withDayOfMonth(1);
        LocalDate end = start.plusMonths(1).minusDays(1);
        String monthName = start.getMonth().getDisplayName(TextStyle.FULL, Locale.ENGLISH);

        List<User> users = userRepository.findAll();

        for (User user : users) {
            List<Expense> lastMonthExpenses = expenseRepository.findByUserIdAndDateBetween(user.getId(), start, end);
            if (lastMonthExpenses.isEmpty()) {
                continue; // Skip users with no expenses in the last month
            }

            double totalSpent = lastMonthExpenses.stream().mapToDouble(Expense::getAmount).sum();
            
            // Category-wise totals
            Map<String, Double> categoryTotals = lastMonthExpenses.stream()
                    .collect(Collectors.groupingBy(
                            Expense::getCategory,
                            Collectors.summingDouble(Expense::getAmount)
                    ));

            // Formulate HTML Email Content
            StringBuilder emailBody = new StringBuilder();
            emailBody.append("<html><body style='font-family: Arial, sans-serif; color: #333;'>");
            emailBody.append("<div style='background-color: #10b981; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;'>");
            emailBody.append("<h2>Monthly Expense Summary - ").append(monthName).append("</h2>");
            emailBody.append("</div>");
            emailBody.append("<div style='padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 5px 5px;'>");
            emailBody.append("<p>Hello <strong>").append(user.getUsername()).append("</strong>,</p>");
            emailBody.append("<p>Here is your financial breakdown for the month of ").append(monthName).append(":</p>");
            
            emailBody.append("<div style='background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin-bottom: 20px;'>");
            emailBody.append("<span style='font-size: 16px; color: #555;'>Total Spending:</span>");
            emailBody.append("<span style='font-size: 24px; font-weight: bold; color: #10b981; margin-left: 10px;'>₹")
                    .append(String.format("%.2f", totalSpent)).append("</span>");
            emailBody.append("</div>");

            emailBody.append("<h3>Category Breakdown</h3>");
            emailBody.append("<table style='width: 100%; border-collapse: collapse; margin-bottom: 20px;'>");
            emailBody.append("<tr style='background-color: #f9fafb;'>");
            emailBody.append("<th style='border: 1px solid #ddd; padding: 8px; text-align: left;'>Category</th>");
            emailBody.append("<th style='border: 1px solid #ddd; padding: 8px; text-align: right;'>Spent (₹)</th>");
            emailBody.append("<th style='border: 1px solid #ddd; padding: 8px; text-align: right;'>Percentage</th>");
            emailBody.append("</tr>");

            for (Map.Entry<String, Double> entry : categoryTotals.entrySet()) {
                double catAmt = entry.getValue();
                double percent = (catAmt / totalSpent) * 100;
                emailBody.append("<tr>");
                emailBody.append("<td style='border: 1px solid #ddd; padding: 8px;'>").append(entry.getKey()).append("</td>");
                emailBody.append("<td style='border: 1px solid #ddd; padding: 8px; text-align: right;'>₹").append(String.format("%.2f", catAmt)).append("</td>");
                emailBody.append("<td style='border: 1px solid #ddd; padding: 8px; text-align: right;'>").append(String.format("%.1f", percent)).append("%</td>");
                emailBody.append("</tr>");
            }
            emailBody.append("</table>");

            emailBody.append("<p>Log into your Expense Tracker dashboard to view custom reports, charts, and AI saving tips.</p>");
            emailBody.append("<br><p>Best regards,<br><strong>Expense Tracker AI Team</strong></p>");
            emailBody.append("</div>");
            emailBody.append("</body></html>");

            emailService.sendMonthlySummary(user.getEmail(), user.getUsername(), emailBody.toString());
        }
    }
}
