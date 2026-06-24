package com.example.expensetracker.service;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    public void sendMonthlySummary(String to, String username, String htmlContent) {
        String subject = "Your Monthly Expense Summary Report - " + username;

        try {
            if (mailSender != null) {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setTo(to);
                helper.setSubject(subject);
                helper.setText(htmlContent, true);
                mailSender.send(message);
                logger.info("Successfully sent monthly summary email to {}", to);
            } else {
                throw new IllegalStateException("JavaMailSender bean is not configured.");
            }
        } catch (Exception e) {
            logger.warn("SMTP email sending failed. Falling back to console logging.");
            logger.info("\n================= EMAIL LOG (FALLBACK) =================\n" +
                    "To: {}\n" +
                    "Subject: {}\n" +
                    "Body:\n{}\n" +
                    "=========================================================", 
                    to, subject, htmlContent);
        }
    }
}
