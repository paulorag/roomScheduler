package com.room.scheduler.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "tb_rooms")
@Data
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Integer capacity;
}
