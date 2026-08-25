package com.room.scheduler.service;

import com.room.scheduler.model.Booking;
import org.springframework.stereotype.Service;

import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;

@Service
public class CalendarExportService {

    private static final DateTimeFormatter ICS_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss'Z'");

    public String generateIcs(Booking booking) {
        String dtStart = booking.getStartAt().atZone(ZoneOffset.systemDefault()).withZoneSameInstant(ZoneOffset.UTC).format(ICS_DATE_FORMAT);
        String dtEnd = booking.getEndAt().atZone(ZoneOffset.systemDefault()).withZoneSameInstant(ZoneOffset.UTC).format(ICS_DATE_FORMAT);
        String dtStamp = (booking.getCreatedAt() != null ? booking.getCreatedAt() : booking.getStartAt())
                .atZone(ZoneOffset.systemDefault()).withZoneSameInstant(ZoneOffset.UTC).format(ICS_DATE_FORMAT);

        return "BEGIN:VCALENDAR\r\n" +
                "VERSION:2.0\r\n" +
                "PRODID:-//RoomScheduler//EN\r\n" +
                "CALSCALE:GREGORIAN\r\n" +
                "METHOD:PUBLISH\r\n" +
                "BEGIN:VEVENT\r\n" +
                "UID:booking-" + booking.getId() + "@roomscheduler.com\r\n" +
                "DTSTAMP:" + dtStamp + "\r\n" +
                "DTSTART:" + dtStart + "\r\n" +
                "DTEND:" + dtEnd + "\r\n" +
                "SUMMARY:Reserva: " + booking.getRoom().getName() + "\r\n" +
                "DESCRIPTION:Reserva de sala no RoomScheduler confirmada para " + booking.getUser().getName() + ".\r\n" +
                "LOCATION:" + booking.getRoom().getName() + "\r\n" +
                "STATUS:CONFIRMED\r\n" +
                "END:VEVENT\r\n" +
                "END:VCALENDAR\r\n";
    }
}
