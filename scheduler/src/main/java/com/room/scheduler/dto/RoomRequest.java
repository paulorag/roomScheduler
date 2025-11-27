package com.room.scheduler.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RoomRequest {

    @NotBlank(message = "O nome da sala é obrigatório")
    private String name;

    @Min(value = 1, message = "A capacidade de ser de pelo menos 1 pessoa")
    private Integer capacity;

}
