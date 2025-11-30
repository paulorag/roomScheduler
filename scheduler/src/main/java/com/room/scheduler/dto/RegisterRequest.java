package com.room.scheduler.dto;

public record RegisterRequest(String name, String email, String password, String role) {
}