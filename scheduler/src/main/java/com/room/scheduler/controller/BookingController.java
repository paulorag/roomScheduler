package com.room.scheduler.controller;

import com.room.scheduler.dto.BookingRequest;
import com.room.scheduler.model.Booking;
import com.room.scheduler.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

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
}
