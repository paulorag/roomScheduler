package com.room.scheduler.service;

import com.room.scheduler.dto.BookingRequest;
import com.room.scheduler.dto.BookingResponse;
import com.room.scheduler.model.Booking;
import com.room.scheduler.model.Room;
import com.room.scheduler.model.User;
import com.room.scheduler.repository.BookingRepository;
import com.room.scheduler.repository.RoomRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class BookingService {
    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final NotificationService notificationService;

    public BookingService(BookingRepository bookingRepository, RoomRepository roomRepository, NotificationService notificationService) {
        this.bookingRepository = bookingRepository;
        this.roomRepository = roomRepository;
        this.notificationService = notificationService;
    }

    public List<BookingResponse> listAll() {
        return bookingRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public Page<BookingResponse> listAllPaged(Pageable pageable) {
        return bookingRepository.findAllByOrderByStartAtDesc(pageable)
                .map(this::mapToResponse);
    }

    public List<BookingResponse> listMyBookings(User user) {
        return bookingRepository.findByUserOrderByStartAtDesc(user).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public Page<BookingResponse> listMyBookingsPaged(User user, Pageable pageable) {
        return bookingRepository.findByUserOrderByStartAtDesc(user, pageable)
                .map(this::mapToResponse);
    }

    public Booking getBookingEntity(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reserva não encontrada"));
    }

    public Booking getBookingForExport(Long id, User currentUser) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reserva não encontrada"));

        boolean isOwner = booking.getUser().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole().equals("ADMIN");

        if (!isOwner && !isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Você não tem permissão para acessar este convite de calendário.");
        }

        return booking;
    }

    @Transactional
    public BookingResponse createBooking(BookingRequest request) {
        if (!request.getEndAt().isAfter(request.getStartAt().plusMinutes(15))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A reserva deve ter no mínimo 15 minutos");
        }

        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sala não encontrada"));

        boolean hasConflict = bookingRepository.existsOverlappingBooking(room.getId(), request.getStartAt(),
                request.getEndAt());

        if (hasConflict) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Esta sala já está reservada para este horário");
        }

        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        Booking booking = new Booking();
        booking.setRoom(room);
        booking.setUser(user);
        booking.setStartAt(request.getStartAt());
        booking.setEndAt(request.getEndAt());

        Booking savedBooking = bookingRepository.save(booking);

        if (notificationService != null) {
            notificationService.sendBookingConfirmation(savedBooking);
        }

        return mapToResponse(savedBooking);
    }

    @Transactional
    public void cancelBooking(Long bookingId, User user) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reserva não encontrada"));

        boolean isOwner = booking.getUser().getId().equals(user.getId());
        boolean isAdmin = user.getRole().equals("ADMIN");

        if (!isOwner && !isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Você não tem permissão para cancelar esta reserva.");
        }

        if (!isAdmin) {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime limit = booking.getStartAt().minusHours(24);

            if (now.isAfter(limit)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Cancelamento não permitido com menos de 24h de antecedência.");
            }
        }

        bookingRepository.delete(booking);

        if (notificationService != null) {
            notificationService.sendCancellationNotice(booking, user);
        }
    }

    private BookingResponse mapToResponse(Booking booking) {
        return new BookingResponse(
                booking.getId(),
                booking.getRoom().getName(),
                booking.getUser().getName(),
                booking.getUser().getEmail(),
                booking.getStartAt(),
                booking.getEndAt());
    }
}