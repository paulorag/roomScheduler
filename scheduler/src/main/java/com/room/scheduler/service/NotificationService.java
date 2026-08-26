package com.room.scheduler.service;

import com.room.scheduler.model.Booking;
import com.room.scheduler.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private final JavaMailSender mailSender;

    public NotificationService(@Autowired(required = false) JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendBookingConfirmation(Booking booking) {
        String subject = "Reserva Confirmada — " + booking.getRoom().getName();
        String message = String.format(
                "Olá %s,\n\nSua reserva para a sala '%s' foi confirmada com sucesso!\n\nInício: %s\nTérmino: %s\n\nAtenciosamente,\nEquipe RoomScheduler",
                booking.getUser().getName(),
                booking.getRoom().getName(),
                booking.getStartAt().format(FORMATTER),
                booking.getEndAt().format(FORMATTER)
        );

        sendEmail(booking.getUser().getEmail(), subject, message);
    }

    public void sendCancellationNotice(Booking booking, User cancelledBy) {
        String subject = "Reserva Cancelada — " + booking.getRoom().getName();
        String message = String.format(
                "Olá %s,\n\nA reserva para a sala '%s' marcada para %s foi cancelada por %s.\n\nAtenciosamente,\nEquipe RoomScheduler",
                booking.getUser().getName(),
                booking.getRoom().getName(),
                booking.getStartAt().format(FORMATTER),
                cancelledBy.getName()
        );

        sendEmail(booking.getUser().getEmail(), subject, message);
    }

    private void sendEmail(String to, String subject, String body) {
        if (mailSender == null) {
            log.info("JavaMailSender não configurado. Notificação simulada para [{}]: {} - {}", to, subject, body);
            return;
        }

        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setTo(to);
            mailMessage.setSubject(subject);
            mailMessage.setText(body);
            mailSender.send(mailMessage);
            log.info("E-mail enviado com sucesso para {}", to);
        } catch (Exception e) {
            log.warn("Não foi possível enviar e-mail para {}: {}", to, e.getMessage());
        }
    }
}
