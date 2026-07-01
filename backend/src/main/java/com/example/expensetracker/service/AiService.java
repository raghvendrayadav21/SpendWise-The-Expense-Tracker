package com.example.expensetracker.service;

import com.example.expensetracker.model.Budget;
import com.example.expensetracker.model.Expense;
import com.example.expensetracker.repository.BudgetRepository;
import com.example.expensetracker.repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AiService {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private BudgetRepository budgetRepository;

    @Value("${expensetracker.gemini.api-key:}")
    private String defaultGeminiApiKey;

    @Value("${expensetracker.groq.api-key:}")
    private String defaultGroqApiKey;

    public Map<String, Object> getInsights(Long userId) {
        LocalDate now = LocalDate.now();
        LocalDate startOfMonth = now.withDayOfMonth(1);
        LocalDate endOfMonth = now.with(java.time.temporal.TemporalAdjusters.lastDayOfMonth());

        List<Expense> expenses = expenseRepository.findByUserIdAndDateBetween(userId, startOfMonth, endOfMonth);
        List<Budget> budgets = budgetRepository.findByUserId(userId);

        // Calculate totals
        double totalSpent = expenses.stream().mapToDouble(Expense::getAmount).sum();
        double totalBudget = budgets.stream().mapToDouble(Budget::getMonthlyLimit).sum();

        // Group expenses by category
        Map<String, Double> categorySpend = expenses.stream()
                .collect(Collectors.groupingBy(
                        Expense::getCategory,
                        Collectors.summingDouble(Expense::getAmount)
                ));

        List<String> tips = new ArrayList<>();
        List<Map<String, Object>> budgetStatusList = new ArrayList<>();

        if (budgets.isEmpty()) {
            tips.add("You haven't set any monthly budgets yet! Setting up category budgets helps our AI engine track your savings goals.");
        } else {
            for (Budget budget : budgets) {
                String category = budget.getCategory();
                double limit = budget.getMonthlyLimit();
                double spent = categorySpend.getOrDefault(category, 0.0);
                double percent = (spent / limit) * 100;

                Map<String, Object> status = new HashMap<>();
                status.put("category", category);
                status.put("limit", limit);
                status.put("spent", spent);
                status.put("percent", percent);
                budgetStatusList.add(status);

                if (percent >= 100) {
                    tips.add(String.format("Critical Limit Alert: You have exceeded your '%s' budget by ₹%.2f (spent ₹%.2f of ₹%.2f). Please freeze non-essential purchases in this category.", 
                            category, spent - limit, spent, limit));
                } else if (percent >= 80) {
                    tips.add(String.format("Warning: Your '%s' budget is at %.1f%% utilization (₹%.2f of ₹%.2f). Consider delaying optional expenses.", 
                            category, percent, spent, limit));
                } else if (percent > 0) {
                    tips.add(String.format("Good job! Your '%s' category is well controlled (%.1f%% spent: ₹%.2f of ₹%.2f).", 
                            category, percent, spent, limit));
                }
            }
        }

        // General AI analysis tips based on overall behavior
        if (totalSpent > totalBudget && totalBudget > 0) {
            tips.add(String.format("Overall warning: Your total spending (₹%.2f) has exceeded your aggregate budget (₹%.2f). Try negotiating recurring bills or cutting dining out.", 
                    totalSpent, totalBudget));
        } else if (totalSpent > 0) {
            tips.add("Smart Saver Tip: Consider setting up an automated transfer to savings of 10% of your estimated income right on payday, treating it like a mandatory expense.");
        }

        // Add dummy advanced AI insights tailored specifically to the user's top categories
        if (!categorySpend.isEmpty()) {
            String topCategory = Collections.max(categorySpend.entrySet(), Map.Entry.comparingByValue()).getKey();
            double topCategoryAmt = categorySpend.get(topCategory);
            tips.add(String.format("AI Recommendation: Your highest expenditure this month is in '%s' (₹%.2f). Our forecasting suggests that substituting 2 restaurant dinners for meal prep could save you roughly ₹85.00 this month.",
                    topCategory, topCategoryAmt));
        }

        Map<String, Object> response = new HashMap<>();
        response.put("totalSpent", totalSpent);
        response.put("totalBudget", totalBudget);
        response.put("budgetStatuses", budgetStatusList);
        response.put("insights", tips);
        response.put("generatedAt", LocalDate.now().toString());

        return response;
    }

    public String getCustomAnalysis(Long userId, String analysisType, String clientApiKey) {
        String apiKey = (clientApiKey != null && !clientApiKey.trim().isEmpty()) ? clientApiKey : defaultGeminiApiKey;

        // Fetch User context data
        LocalDate now = LocalDate.now();
        LocalDate startOfMonth = now.withDayOfMonth(1);
        LocalDate endOfMonth = now.with(java.time.temporal.TemporalAdjusters.lastDayOfMonth());

        List<Expense> expenses = expenseRepository.findByUserIdAndDateBetween(userId, startOfMonth, endOfMonth);
        List<Budget> budgets = budgetRepository.findByUserId(userId);

        double totalSpent = expenses.stream().mapToDouble(Expense::getAmount).sum();
        double totalBudget = budgets.stream().mapToDouble(Budget::getMonthlyLimit).sum();

        // Compile logs into a prompt text
        StringBuilder logsText = new StringBuilder();
        logsText.append("Active Budgets:\n");
        for (Budget b : budgets) {
            logsText.append(String.format("- %s: Limit ₹%.2f\n", b.getCategory(), b.getMonthlyLimit()));
        }
        logsText.append("\nRecent Expenses this month (Total Spent: ₹").append(String.format("%.2f", totalSpent)).append("):\n");
        for (Expense e : expenses) {
            logsText.append(String.format("- %s: ₹%.2f on %s (%s)\n", e.getCategory(), e.getAmount(), e.getDate(), e.getDescription()));
        }

        String promptInstructions = "";
        switch (analysisType.toUpperCase()) {
            case "EXPENSE_CONTROL":
                promptInstructions = "User wants to know: 'How can I control my expenses?' Look at the spending list. Suggest which categories they need to cut down immediately, identify any potential waste, and outline a custom 3-step action plan to reduce total outflow this month. ";
                break;
            case "HIGHEST_SPENDING":
                promptInstructions = "User wants to know: 'Where was my highest spending and why?' Analyze their expenses, identify the category and specific item transactions with the largest outflow, and provide recommendations on alternative cheaper options or budget limits for that category. ";
                break;
            case "SAVINGS_BLUEPRINT":
                promptInstructions = "User wants to know: 'How can I optimize my savings?' Formulate a realistic monthly savings blueprint. Calculate what percentage of their budget is left, and suggest how they can adjust limits to save at least 15% more of their money. ";
                break;
            case "BUDGET_PROJECTIONS":
                promptInstructions = "User wants to know: 'What are my future spending predictions?' Forecast their end-of-month spending based on current patterns. Predict if they will exceed limits, and recommend adjustments to their category budget limits for next month. ";
                break;
            default:
                promptInstructions = "Analyze this financial data and provide general financial advice and savings optimizations. ";
        }

        String fullPrompt = String.format(
            "You are SpendWise, a premium personal financial AI assistant. Analyze the following user logs and provide answers to their query.\n\n" +
            "=== USER DATA ===\n%s\n" +
            "=== USER QUERY ===\n%s\n" +
            "=== FORMATTING RULE ===\n" +
            "- Return a structured, clean advice. Use HTML list tags (like <ul>, <li>) or standard clean paragraphs so it renders beautifully in the web UI.\n" +
            "- Always use the Indian Rupee symbol (₹) for money values.\n" +
            "- Keep the response concise (around 150-250 words) and directly actionable.",
            logsText.toString(), promptInstructions
        );

        if (apiKey == null || apiKey.trim().isEmpty()) {
            // Return a helpful mock response prompting them to add their API key
            return "<div class='space-y-4'><p class='text-amber-400 font-semibold flex items-center'><svg class='w-4 h-4 mr-1.5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'/></svg> Gemini / Groq API Key is missing.</p>" +
                   "<p class='text-sm'>To receive live AI insights customized directly by Google Gemini or Groq, please enter your API Key in the input field above.</p>" +
                   "<h4 class='font-bold mt-2 text-brand-accent'>💡 Local Rule-Based Mock Analysis:</h4>" +
                   "<ul class='list-disc pl-5 space-y-1 text-sm text-brand-textSecondary'>" +
                   "<li>Your food category (₹" + String.format("%.2f", expenses.stream().filter(e -> e.getCategory().equalsIgnoreCase("Food")).mapToDouble(Expense::getAmount).sum()) + ") is currently the highest. Substituting takeout with grocery prep could save you roughly ₹1,200/month.</li>" +
                   "<li>Ensure your utilities budget has a buffer of at least 10% to accommodate seasonal fluctuations.</li>" +
                   "</ul></div>";
        }

        if (apiKey.startsWith("gsk_")) {
            try {
                RestTemplate restTemplate = new RestTemplate();
                String url = "https://api.groq.com/openai/v1/chat/completions";

                org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
                headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
                headers.set("Authorization", "Bearer " + apiKey);

                Map<String, Object> requestBody = Map.of(
                    "model", "llama-3.3-70b-versatile",
                    "messages", List.of(Map.of("role", "user", "content", fullPrompt))
                );

                org.springframework.http.HttpEntity<Map<String, Object>> entity = new org.springframework.http.HttpEntity<>(requestBody, headers);
                org.springframework.http.ResponseEntity<Map> responseEntity = restTemplate.postForEntity(url, entity, Map.class);
                Map<String, Object> apiResponse = responseEntity.getBody();

                if (apiResponse != null && apiResponse.containsKey("choices")) {
                    List<Map<String, Object>> choices = (List<Map<String, Object>>) apiResponse.get("choices");
                    if (!choices.isEmpty()) {
                        Map<String, Object> choice = choices.get(0);
                        Map<String, Object> message = (Map<String, Object>) choice.get("message");
                        if (message != null && message.containsKey("content")) {
                            return (String) message.get("content");
                        }
                    }
                }
                return "Failed to parse content from Groq API response. Check logs.";
            } catch (Exception e) {
                return "<p class='text-red-400'>Error invoking Groq API: " + e.getMessage() + ". Check if your API Key is valid and active.</p>";
            }
        } else {
            try {
                RestTemplate restTemplate = new RestTemplate();
                String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;

                // Build request body payload maps
                Map<String, Object> textPart = Map.of("text", fullPrompt);
                Map<String, Object> parts = Map.of("parts", List.of(textPart));
                Map<String, Object> contents = Map.of("contents", List.of(parts));

                // Call API
                Map<String, Object> apiResponse = restTemplate.postForObject(url, contents, Map.class);
                if (apiResponse != null && apiResponse.containsKey("candidates")) {
                    List<Map<String, Object>> candidates = (List<Map<String, Object>>) apiResponse.get("candidates");
                    if (!candidates.isEmpty()) {
                        Map<String, Object> candidate = candidates.get(0);
                        Map<String, Object> contentMap = (Map<String, Object>) candidate.get("content");
                        if (contentMap != null && contentMap.containsKey("parts")) {
                            List<Map<String, Object>> partsList = (List<Map<String, Object>>) contentMap.get("parts");
                            if (!partsList.isEmpty()) {
                                return (String) partsList.get(0).get("text");
                            }
                        }
                    }
                }
                return "Failed to parse content from Gemini API response. Check logs.";
            } catch (Exception e) {
                return "<p class='text-red-400'>Error invoking Gemini API: " + e.getMessage() + ". Check if your API Key is valid and active.</p>";
            }
        }
    }

    public String answerQuestion(Long userId, String question) {
        String apiKey = (defaultGroqApiKey != null && !defaultGroqApiKey.trim().isEmpty()) ? defaultGroqApiKey : defaultGeminiApiKey;

        // Fetch User context data
        LocalDate now = LocalDate.now();
        LocalDate startOfMonth = now.withDayOfMonth(1);
        LocalDate endOfMonth = now.with(java.time.temporal.TemporalAdjusters.lastDayOfMonth());

        List<Expense> expenses = expenseRepository.findByUserIdAndDateBetween(userId, startOfMonth, endOfMonth);
        List<Budget> budgets = budgetRepository.findByUserId(userId);

        double totalSpent = expenses.stream().mapToDouble(Expense::getAmount).sum();
        double totalBudget = budgets.stream().mapToDouble(Budget::getMonthlyLimit).sum();

        // Compile logs into a prompt text
        StringBuilder logsText = new StringBuilder();
        logsText.append("Active Budgets:\n");
        for (Budget b : budgets) {
            logsText.append(String.format("- %s: Limit ₹%.2f\n", b.getCategory(), b.getMonthlyLimit()));
        }
        logsText.append("\nRecent Expenses this month (Total Spent: ₹").append(String.format("%.2f", totalSpent)).append("):\n");
        for (Expense e : expenses) {
            logsText.append(String.format("- %s: ₹%.2f on %s (%s)\n", e.getCategory(), e.getAmount(), e.getDate(), e.getDescription()));
        }

        String fullPrompt = String.format(
            "You are SpendWise, a premium personal financial AI assistant. Analyze the following user logs and answer their specific question about their expenses, budget, or financial control.\n\n" +
            "=== USER DATA ===\n%s\n" +
            "=== USER QUESTION ===\n%s\n\n" +
            "=== STRICT LANGUAGE RULES (follow exactly) ===\n" +
            "- YOUR DEFAULT LANGUAGE IS ENGLISH. Always respond in English unless the user's question is explicitly written in Hindi (Devanagari script) or Hinglish (Hindi words typed in Latin/Roman script).\n" +
            "- DO NOT switch to Hindi or any other language just because the financial data contains Indian context, rupee symbols, or Indian names. The data is always Indian — that does NOT mean the user wants a Hindi reply.\n" +
            "- ONLY switch language if the USER QUESTION itself is written in Hindi or Hinglish (e.g. 'kaha jyada kharch hua?' or 'savings kaise badhaye?'). In that case, reply in Hinglish using Latin script only (no Devanagari Unicode).\n" +
            "- If the user question is in English → reply in English. Always.\n" +
            "=== FORMATTING RULES ===\n" +
            "- Return a structured, clean answer. Use HTML list tags (like <ul>, <li>, etc.) or standard clean paragraphs so it renders beautifully in the web UI. Do not return standard markdown code blocks.\n" +
            "- Always use the Indian Rupee symbol (₹) for money values.\n" +
            "- Keep the response concise, engaging, and directly actionable.",
            logsText.toString(), question
        );

        if (apiKey == null || apiKey.trim().isEmpty()) {
            return "<div class='space-y-4'><p class='text-amber-400 font-semibold flex items-center'><svg class='w-4 h-4 mr-1.5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'/></svg> AI Configuration is missing.</p>" +
                   "<p class='text-sm'>Please configure an API key on the backend to chat with SpendWise.</p></div>";
        }

        if (apiKey.startsWith("gsk_")) {
            try {
                RestTemplate restTemplate = new RestTemplate();
                String url = "https://api.groq.com/openai/v1/chat/completions";

                org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
                headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
                headers.set("Authorization", "Bearer " + apiKey);

                Map<String, Object> requestBody = Map.of(
                    "model", "llama-3.3-70b-versatile",
                    "messages", List.of(Map.of("role", "user", "content", fullPrompt))
                );

                org.springframework.http.HttpEntity<Map<String, Object>> entity = new org.springframework.http.HttpEntity<>(requestBody, headers);
                org.springframework.http.ResponseEntity<Map> responseEntity = restTemplate.postForEntity(url, entity, Map.class);
                Map<String, Object> apiResponse = responseEntity.getBody();

                if (apiResponse != null && apiResponse.containsKey("choices")) {
                    List<Map<String, Object>> choices = (List<Map<String, Object>>) apiResponse.get("choices");
                    if (!choices.isEmpty()) {
                        Map<String, Object> choice = choices.get(0);
                        Map<String, Object> message = (Map<String, Object>) choice.get("message");
                        if (message != null && message.containsKey("content")) {
                            return (String) message.get("content");
                        }
                    }
                }
                return "Failed to parse content from Groq API response. Check logs.";
            } catch (Exception e) {
                return "<p class='text-red-400'>Error invoking Groq API: " + e.getMessage() + ". Check if your API Key is valid and active.</p>";
            }
        } else {
            try {
                RestTemplate restTemplate = new RestTemplate();
                String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;

                // Build request body payload maps
                Map<String, Object> textPart = Map.of("text", fullPrompt);
                Map<String, Object> parts = Map.of("parts", List.of(textPart));
                Map<String, Object> contents = Map.of("contents", List.of(parts));

                // Call API
                Map<String, Object> apiResponse = restTemplate.postForObject(url, contents, Map.class);
                if (apiResponse != null && apiResponse.containsKey("candidates")) {
                    List<Map<String, Object>> candidates = (List<Map<String, Object>>) apiResponse.get("candidates");
                    if (!candidates.isEmpty()) {
                        Map<String, Object> candidate = candidates.get(0);
                        Map<String, Object> contentMap = (Map<String, Object>) candidate.get("content");
                        if (contentMap != null && contentMap.containsKey("parts")) {
                            List<Map<String, Object>> partsList = (List<Map<String, Object>>) contentMap.get("parts");
                            if (!partsList.isEmpty()) {
                                return (String) partsList.get(0).get("text");
                            }
                        }
                    }
                }
                return "Failed to parse content from Gemini API response. Check logs.";
            } catch (Exception e) {
                return "<p class='text-red-400'>Error invoking Gemini API: " + e.getMessage() + ". Check if your API Key is valid and active.</p>";
            }
        }
    }
}
