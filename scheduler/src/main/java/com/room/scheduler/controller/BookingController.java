package com.room.scheduler.controller;

import com.room.scheduler.dto.BookingRequest;
import com.room.scheduler.dto.BookingResponse;
import com.room.scheduler.model.Booking;
import com.room.scheduler.model.User;
import com.room.scheduler.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public Booking create(@RequestBody @Valid BookingRequest request) {
        return bookingService.createBooking(request);
    }

    @GetMapping
    public List<BookingResponse> listAll() {
        return bookingService.listAll();
    }

    @GetMapping("/my")
    public List<BookingResponse> listMyBookings() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return bookingService.listMyBookings(user);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancel(@PathVariable Long id) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        bookingService.cancelBooking(id, user);

        return ResponseEntity.noContent().build();
    }
}