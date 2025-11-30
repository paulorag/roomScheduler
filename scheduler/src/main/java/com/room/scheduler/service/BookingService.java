package com.room.scheduler.service;

import com.room.scheduler.dto.BookingRequest;
import com.room.scheduler.model.Booking;
import com.room.scheduler.model.Room;
import com.room.scheduler.repository.BookingRepository;
import com.room.scheduler.repository.RoomRepository;

import org.springframework.transaction.annotation.Transactional;

import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@Service
@Transactional(readOnly = true)
public class BookingService {
    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;

    public BookingService(BookingRepository bookingRepository, RoomRepository roomRepository) {
        this.bookingRepository = bookingRepository;
        this.roomRepository = roomRepository;
    }

    @Transactional
    public Booking createBooking(BookingRequest request) {
        if (!request.getEndAt().isAfter(request.getStartAt().plusMinutes(15))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A data final deve ser maior que a inicial");
        }

        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sala não encontrada"));

        boolean hasConflict = bookingRepository.existsOverlappingBooking(room.getId(), request.getStartAt(),
                request.getEndAt());

        if (hasConflict) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Esta sala já está reservada para este horário");
        }

        Booking booking = new Booking();
        booking.setRoom(room);
        booking.setStartAt(request.getStartAt());
        booking.setEndAt(request.getEndAt());

        return bookingRepository.save(booking);
    }

}
