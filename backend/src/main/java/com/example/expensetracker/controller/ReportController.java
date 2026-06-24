package com.example.expensetracker.controller;

import com.example.expensetracker.security.UserDetailsImpl;
import com.example.expensetracker.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportService reportService;

    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userDetails.getId();
    }

    @GetMapping("/excel")
    @PreAuthorize("hasAnyRole('NORMAL', 'PREMIUM', 'ADMIN')")
    public ResponseEntity<byte[]> getExcelReport(
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            byte[] fileContent = reportService.generateExcelReport(getCurrentUserId(), startDate, endDate);
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=ExpenseReport_" + startDate + "_to_" + endDate + ".xlsx")
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(fileContent);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(null);
        }
    }

    @GetMapping("/pdf")
    @PreAuthorize("hasAnyRole('NORMAL', 'PREMIUM', 'ADMIN')")
    public ResponseEntity<byte[]> getPdfReport(
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            byte[] fileContent = reportService.generatePdfReport(getCurrentUserId(), startDate, endDate);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=ExpenseReport_" + startDate + "_to_" + endDate + ".pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(fileContent);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(null);
        }
    }
}
