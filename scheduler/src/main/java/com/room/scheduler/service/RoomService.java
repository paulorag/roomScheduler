package com.room.scheduler.service;

import com.room.scheduler.dto.RoomRequest;
import com.room.scheduler.model.Room;
import com.room.scheduler.repository.RoomRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoomService {
    private final RoomRepository roomRepository;

    public RoomService(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    public Room createRoom(RoomRequest request) {
        Room room = new Room();
        room.setName(request.getName());
        room.setCapacity(request.getCapacity());

        return roomRepository.save(room);
    }

    public void delete(Long id) {
        roomRepository.deleteById(id);
    }

    public List<Room> listAll() {
        return roomRepository.findAll();
    }
}
