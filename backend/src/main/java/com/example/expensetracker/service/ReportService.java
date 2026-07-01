package com.example.expensetracker.service;

import com.example.expensetracker.model.Expense;
import com.example.expensetracker.repository.ExpenseRepository;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ReportService {

    @Autowired
    private ExpenseRepository expenseRepository;

    public byte[] generateExcelReport(Long userId, LocalDate startDate, LocalDate endDate) throws IOException {
        // JPA Between is inclusive on both ends
        List<Expense> expenses = expenseRepository.findByUserIdAndDateBetween(userId, startDate, endDate);

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Monthly Expense Report");

            // Header Font & Style
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());

            CellStyle headerCellStyle = workbook.createCellStyle();
            headerCellStyle.setFont(headerFont);
            headerCellStyle.setFillForegroundColor(IndexedColors.SEA_GREEN.getIndex());
            headerCellStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerCellStyle.setAlignment(HorizontalAlignment.CENTER);

            // Create Header Row
            String[] columns = {"Date", "Category", "Amount (₹)", "Description"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < columns.length; i++) {
                org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerCellStyle);
            }

            CreationHelper createHelper = workbook.getCreationHelper();

            // Currency formatting
            CellStyle currencyCellStyle = workbook.createCellStyle();
            currencyCellStyle.setDataFormat(createHelper.createDataFormat().getFormat("₹#,##0.00"));

            int rowIdx = 1;
            for (Expense expense : expenses) {
                Row row = sheet.createRow(rowIdx++);

                org.apache.poi.ss.usermodel.Cell dateCell = row.createCell(0);
                dateCell.setCellValue(expense.getDate().toString());

                row.createCell(1).setCellValue(expense.getCategory());

                org.apache.poi.ss.usermodel.Cell amountCell = row.createCell(2);
                amountCell.setCellValue(expense.getAmount());
                amountCell.setCellStyle(currencyCellStyle);

                row.createCell(3).setCellValue(expense.getDescription());
            }

            // Summary Row
            Row summaryRow = sheet.createRow(rowIdx);
            
            CellStyle labelCellStyle = workbook.createCellStyle();
            Font boldFont = workbook.createFont();
            boldFont.setBold(true);
            labelCellStyle.setFont(boldFont);
            labelCellStyle.setAlignment(HorizontalAlignment.RIGHT);

            org.apache.poi.ss.usermodel.Cell totalLabelCell = summaryRow.createCell(1);
            totalLabelCell.setCellValue("TOTAL:");
            totalLabelCell.setCellStyle(labelCellStyle);

            // Style combining Bold & Currency
            CellStyle totalCellStyle = workbook.createCellStyle();
            totalCellStyle.setFont(boldFont);
            totalCellStyle.setDataFormat(createHelper.createDataFormat().getFormat("₹#,##0.00"));

            org.apache.poi.ss.usermodel.Cell totalCell = summaryRow.createCell(2);
            // Only use SUM formula if there are data rows; otherwise set 0 to avoid circular ref
            if (rowIdx > 1) {
                totalCell.setCellFormula("SUM(C2:C" + rowIdx + ")");
            } else {
                totalCell.setCellValue(0.0);
            }
            totalCell.setCellStyle(totalCellStyle);

            // Auto-size columns
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }

    public byte[] generatePdfReport(Long userId, LocalDate startDate, LocalDate endDate) throws Exception {
        // JPA Between is inclusive on both ends
        List<Expense> expenses = expenseRepository.findByUserIdAndDateBetween(userId, startDate, endDate);
        double totalExpense = expenses.stream().mapToDouble(Expense::getAmount).sum();

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(out);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);

        // Title
        Paragraph title = new Paragraph("Expense Tracker - Monthly Statement")
                .setFontSize(20)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(10);
        document.add(title);

        // Date Range
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        Paragraph dateRange = new Paragraph("Period: " + startDate.format(dtf) + " to " + endDate.format(dtf))
                .setFontSize(12)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(20);
        document.add(dateRange);

        // Table setup: 4 columns
        float[] columnWidths = {1.5f, 2f, 1.5f, 3f};
        Table table = new Table(UnitValue.createPercentArray(columnWidths));
        table.setWidth(UnitValue.createPercentValue(100));

        // Table Header
        String[] headers = {"Date", "Category", "Amount", "Description"};
        for (String header : headers) {
            Cell cell = new Cell().add(new Paragraph(header).setBold())
                    .setBackgroundColor(ColorConstants.LIGHT_GRAY)
                    .setTextAlignment(TextAlignment.CENTER);
            table.addHeaderCell(cell);
        }

        // Table Rows
        for (Expense expense : expenses) {
            table.addCell(new Cell().add(new Paragraph(expense.getDate().toString())).setTextAlignment(TextAlignment.CENTER));
            table.addCell(new Cell().add(new Paragraph(expense.getCategory())).setTextAlignment(TextAlignment.LEFT));
            table.addCell(new Cell().add(new Paragraph(String.format("₹%.2f", expense.getAmount()))).setTextAlignment(TextAlignment.RIGHT));
            table.addCell(new Cell().add(new Paragraph(expense.getDescription())).setTextAlignment(TextAlignment.LEFT));
        }

        // Total Row
        table.addCell(new Cell(1, 2).add(new Paragraph("TOTAL:").setBold()).setTextAlignment(TextAlignment.RIGHT));
        table.addCell(new Cell().add(new Paragraph(String.format("₹%.2f", totalExpense)).setBold()).setTextAlignment(TextAlignment.RIGHT));
        table.addCell(new Cell().add(new Paragraph("")));

        document.add(table);
        document.close();

        return out.toByteArray();
    }
}
