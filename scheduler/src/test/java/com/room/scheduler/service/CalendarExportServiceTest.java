package com.room.scheduler.service;

import com.room.scheduler.model.Booking;
import com.room.scheduler.model.Room;
import com.room.scheduler.model.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

public class CalendarExportServiceTest {

    private final CalendarExportService calendarExportService = new CalendarExportService();

    @Test
    @DisplayName("Deve gerar arquivo iCalendar (.ics) formatado corretamente")
    void shouldGenerateValidIcsContent() {
        User user = new User();
        user.setName("Paulo Gomes");

        Room room = new Room();
        room.setName("Auditório Principal");

        Booking booking = new Booking();
        booking.setId(42L);
        booking.setUser(user);
        booking.setRoom(room);
        booking.setStartAt(LocalDateTime.of(2026, 9, 10, 14, 0));
        booking.setEndAt(LocalDateTime.of(2026, 9, 10, 15, 0));
        booking.setCreatedAt(LocalDateTime.of(2026, 9, 1, 10, 0));

        String ics = calendarExportService.generateIcs(booking);

        assertNotNull(ics);
        assertTrue(ics.contains("BEGIN:VCALENDAR"));
        assertTrue(ics.contains("BEGIN:VEVENT"));
        assertTrue(ics.contains("UID:booking-42@roomscheduler.com"));
        assertTrue(ics.contains("SUMMARY:Reserva: Auditório Principal"));
        assertTrue(ics.contains("LOCATION:Auditório Principal"));
        assertTrue(ics.contains("STATUS:CONFIRMED"));
        assertTrue(ics.contains("END:VEVENT"));
        assertTrue(ics.contains("END:VCALENDAR"));
    }
}
