package com.room.scheduler.controller;

import com.room.scheduler.dto.RoomRequest;
import com.room.scheduler.model.Room;
import com.room.scheduler.service.RoomService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {
    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @GetMapping
    public List<Room> listAll() {
        return roomService.listAll();
    }

    @PostMapping
    public Room create(@RequestBody @Valid RoomRequest request) {
        return roomService.createRoom(request);
    }
}
