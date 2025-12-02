package com.room.scheduler.dto;

import java.time.LocalDateTime;

public record BookingResponse(
        Long id,
        String roomName,
        String userName,
        String userEmail,
        LocalDateTime startAt,
        LocalDateTime endAt) {
}
