package com.room.scheduler.controller;

import com.room.scheduler.dto.BookingRequest;
import com.room.scheduler.dto.BookingResponse;
import com.room.scheduler.model.Booking;
import com.room.scheduler.model.User;
import com.room.scheduler.service.BookingService;
import com.room.scheduler.service.CalendarExportService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;
    private final CalendarExportService calendarExportService;

    public BookingController(BookingService bookingService, CalendarExportService calendarExportService) {
        this.bookingService = bookingService;
        this.calendarExportService = calendarExportService;
    }

    @PostMapping
    public ResponseEntity<BookingResponse> create(@RequestBody @Valid BookingRequest request) {
        BookingResponse response = bookingService.createBooking(request);
        return ResponseEntity.status(org.springframework.http.HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public List<BookingResponse> listAll() {
        return bookingService.listAll();
    }

    @GetMapping("/page")
    public Page<BookingResponse> listAllPaged(@PageableDefault(size = 10) Pageable pageable) {
        return bookingService.listAllPaged(pageable);
    }

    @GetMapping("/my")
    public List<BookingResponse> listMyBookings() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return bookingService.listMyBookings(user);
    }

    @GetMapping("/my/page")
    public Page<BookingResponse> listMyBookingsPaged(@PageableDefault(size = 10) Pageable pageable) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return bookingService.listMyBookingsPaged(user, pageable);
    }

    @GetMapping("/{id}/ics")
    public ResponseEntity<byte[]> exportIcs(@PathVariable Long id) {
        Booking booking = bookingService.getBookingEntity(id);
        String icsContent = calendarExportService.generateIcs(booking);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"booking-" + id + ".ics\"")
                .contentType(MediaType.parseMediaType("text/calendar; charset=utf-8"))
                .body(icsContent.getBytes());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancel(@PathVariable Long id) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        bookingService.cancelBooking(id, user);

        return ResponseEntity.noContent().build();
    }
}