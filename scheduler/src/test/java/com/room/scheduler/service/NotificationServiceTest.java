package com.room.scheduler.service;

import com.room.scheduler.model.Booking;
import com.room.scheduler.model.Room;
import com.room.scheduler.model.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class NotificationServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private NotificationService notificationService;

    @Test
    @DisplayName("Deve enviar e-mail de confirmação de reserva quando mailSender estiver disponível")
    void shouldSendConfirmationEmail() {
        User user = new User();
        user.setName("Paulo");
        user.setEmail("paulo@test.com");

        Room room = new Room();
        room.setName("Sala Beta");

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setRoom(room);
        booking.setStartAt(LocalDateTime.of(2026, 9, 15, 10, 0));
        booking.setEndAt(LocalDateTime.of(2026, 9, 15, 11, 0));

        assertDoesNotThrow(() -> notificationService.sendBookingConfirmation(booking));
        verify(mailSender, times(1)).send(any(SimpleMailMessage.class));
    }

    @Test
    @DisplayName("Deve enviar e-mail de cancelamento quando mailSender estiver disponível")
    void shouldSendCancellationEmail() {
        User user = new User();
        user.setName("Paulo");
        user.setEmail("paulo@test.com");

        User admin = new User();
        admin.setName("Admin");

        Room room = new Room();
        room.setName("Sala Beta");

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setRoom(room);
        booking.setStartAt(LocalDateTime.of(2026, 9, 15, 10, 0));
        booking.setEndAt(LocalDateTime.of(2026, 9, 15, 11, 0));

        assertDoesNotThrow(() -> notificationService.sendCancellationNotice(booking, admin));
        verify(mailSender, times(1)).send(any(SimpleMailMessage.class));
    }
}
