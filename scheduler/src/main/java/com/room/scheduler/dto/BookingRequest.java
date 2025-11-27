package com.room.scheduler.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class BookingRequest {
    @NotNull(message = "O ID da sala é obrigatório")
    private Long roomId;

    @NotNull(message = "Data de início obrigatória")
    @Future(message = "A data deve ser no futuro")
    private LocalDateTime startAt;

    @NotNull(message = "Data de fim obrigatória")
    @Future(message = "A data deve ser no futuro")
    private LocalDateTime endAt;
}
