package com.room.scheduler.controller;

import com.room.scheduler.dto.RoomRequest;
import com.room.scheduler.model.Room;
import com.room.scheduler.service.RoomService;
import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
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

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        roomService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public Room update(@PathVariable Long id, @RequestBody @Valid RoomRequest request) {
        return roomService.updateRoom(id, request);
    }
}
