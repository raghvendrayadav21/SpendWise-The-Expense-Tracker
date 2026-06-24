package com.example.expensetracker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class JwtResponse {
    private String token;
    private String id;
    private String username;
    private String email;
    private List<String> roles;
    private boolean profileUpdated;
}
