package com.room.scheduler.repository;

import com.room.scheduler.model.Booking;
import com.room.scheduler.model.Room;
import com.room.scheduler.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@DataJpaTest
public class BookingRepositoryTest {
    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private UserRepository userRepository;

    private User testUser;

    @BeforeEach
    void setUp() {
        User user = new User();
        user.setName("Usuario Teste");
        user.setEmail("teste@email.com");
        user.setPassword("123456");
        user.setRole("USER");
        testUser = userRepository.save(user);
    }

    @Test
    @DisplayName("Deve retornar TRUE quando houver conflito de horário")
    void shouldReturnTrueWhenBookingOverlaps() {
        Room room = new Room();
        room.setName("Sala Teste");
        room.setCapacity(10);
        roomRepository.save(room);

        Booking booking = new Booking();
        booking.setRoom(room);
        booking.setUser(testUser);
        booking.setStartAt(LocalDateTime.of(2025, 12, 20, 14, 0));
        booking.setEndAt(LocalDateTime.of(2025, 12, 20, 15, 0));
        bookingRepository.save(booking);

        boolean exists = bookingRepository.existsOverlappingBooking(room.getId(),
                LocalDateTime.of(2025, 12, 20, 14, 30), LocalDateTime.of(2025, 12, 20, 15, 30));

        assertTrue(exists, "Deveria ter encontrado um conflito");
    }

    @Test
    @DisplayName("Deve retornar FALSE quando os horários forem adjacentes (encostados)")
    void shouldReturnFalseWhenTimesAreAdjacent() {
        Room room = new Room();
        room.setName("Sala Teste 2");
        room.setCapacity(10);
        roomRepository.save(room);

        Booking booking = new Booking();
        booking.setRoom(room);
        booking.setUser(testUser);
        booking.setStartAt(LocalDateTime.of(2025, 12, 20, 14, 0));
        booking.setEndAt(LocalDateTime.of(2025, 12, 20, 15, 0));
        bookingRepository.save(booking);

        boolean exists = bookingRepository.existsOverlappingBooking(
                room.getId(),
                LocalDateTime.of(2025, 12, 20, 15, 0),
                LocalDateTime.of(2025, 12, 20, 16, 0));

        assertFalse(exists, "Não deveria haver conflito em horários encostados");
    }
}
