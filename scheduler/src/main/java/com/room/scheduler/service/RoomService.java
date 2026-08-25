package com.room.scheduler.service;

import com.room.scheduler.dto.RoomRequest;
import com.room.scheduler.model.Room;
import com.room.scheduler.repository.BookingRepository;
import com.room.scheduler.repository.RoomRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class RoomService {
    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;

    public RoomService(RoomRepository roomRepository, BookingRepository bookingRepository) {
        this.roomRepository = roomRepository;
        this.bookingRepository = bookingRepository;
    }

    @Transactional
    public Room createRoom(RoomRequest request) {
        Room room = new Room();
        room.setName(request.getName());
        room.setCapacity(request.getCapacity());

        return roomRepository.save(room);
    }

    @Transactional
    public void delete(Long id) {
        if (!roomRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Sala não encontrada");
        }

        if (bookingRepository.existsByRoomId(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Não é possível excluir a sala pois existem reservas vinculadas.");
        }

        roomRepository.deleteById(id);
    }

    public List<Room> listAll() {
        return roomRepository.findAll();
    }

    @Transactional
    public Room updateRoom(Long id, RoomRequest request) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sala não encontrada"));

        room.setName(request.getName());
        room.setCapacity(request.getCapacity());

        return roomRepository.save(room);
    }
}
