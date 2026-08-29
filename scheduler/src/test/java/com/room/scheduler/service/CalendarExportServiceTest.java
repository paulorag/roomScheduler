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

    @Test
    @DisplayName("Deve sanitizar quebras de linha e caracteres especiais para evitar CRLF injection")
    void shouldSanitizeCrlfInIcsContent() {
        User user = new User();
        user.setName("Usuario Malicioso\r\nATTENDEE;CN=Hacker:mailto:hacker@evil.com\nNovoCampo:Valor");

        Room room = new Room();
        room.setName("Sala Alpha\r\nLOCATION:Sala Injetada");

        Booking booking = new Booking();
        booking.setId(99L);
        booking.setUser(user);
        booking.setRoom(room);
        booking.setStartAt(LocalDateTime.of(2026, 9, 10, 14, 0));
        booking.setEndAt(LocalDateTime.of(2026, 9, 10, 15, 0));

        String ics = calendarExportService.generateIcs(booking);

        assertNotNull(ics);
        assertFalse(ics.contains("\r\nATTENDEE;CN=Hacker"));
        assertFalse(ics.contains("\nNovoCampo:Valor"));
        assertFalse(ics.contains("\r\nLOCATION:Sala Injetada"));
    }
}
