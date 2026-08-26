package com.room.scheduler.service;

import com.room.scheduler.dto.BookingRequest;
import com.room.scheduler.dto.BookingResponse;
import com.room.scheduler.model.Booking;
import com.room.scheduler.model.Room;
import com.room.scheduler.model.User;
import com.room.scheduler.repository.BookingRepository;
import com.room.scheduler.repository.RoomRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private BookingService bookingService;

    private User standardUser;
    private User adminUser;
    private Room testRoom;

    @BeforeEach
    void setUp() {
        standardUser = new User();
        standardUser.setId(1L);
        standardUser.setName("User Test");
        standardUser.setEmail("user@test.com");
        standardUser.setRole("USER");

        adminUser = new User();
        adminUser.setId(2L);
        adminUser.setName("Admin Test");
        adminUser.setEmail("admin@test.com");
        adminUser.setRole("ADMIN");

        testRoom = new Room();
        testRoom.setId(10L);
        testRoom.setName("Sala Alpha");
        testRoom.setCapacity(8);

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(standardUser, null, standardUser.getAuthorities())
        );
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("Deve criar reserva com sucesso")
    void shouldCreateBookingSuccessfully() {
        LocalDateTime startAt = LocalDateTime.now().plusDays(2);
        LocalDateTime endAt = startAt.plusHours(1);

        BookingRequest request = new BookingRequest();
        request.setRoomId(10L);
        request.setStartAt(startAt);
        request.setEndAt(endAt);

        Booking booking = new Booking();
        booking.setId(100L);
        booking.setRoom(testRoom);
        booking.setUser(standardUser);
        booking.setStartAt(startAt);
        booking.setEndAt(endAt);

        when(roomRepository.findById(10L)).thenReturn(Optional.of(testRoom));
        when(bookingRepository.existsOverlappingBooking(10L, startAt, endAt)).thenReturn(false);
        when(bookingRepository.save(any(Booking.class))).thenReturn(booking);

        BookingResponse response = bookingService.createBooking(request);

        assertNotNull(response);
        assertEquals(100L, response.id());
        assertEquals("Sala Alpha", response.roomName());
        assertEquals("User Test", response.userName());
        verify(bookingRepository, times(1)).save(any(Booking.class));
    }

    @Test
    @DisplayName("Deve lançar erro ao tentar reservar por menos de 15 minutos")
    void shouldThrowExceptionWhenDurationLessThan15Minutes() {
        LocalDateTime startAt = LocalDateTime.now().plusDays(2);
        LocalDateTime endAt = startAt.plusMinutes(10);

        BookingRequest request = new BookingRequest();
        request.setRoomId(10L);
        request.setStartAt(startAt);
        request.setEndAt(endAt);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () ->
                bookingService.createBooking(request)
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        verify(bookingRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve lançar conflito quando houver sobreposição de horário")
    void shouldThrowConflictWhenBookingOverlaps() {
        LocalDateTime startAt = LocalDateTime.now().plusDays(2);
        LocalDateTime endAt = startAt.plusHours(1);

        BookingRequest request = new BookingRequest();
        request.setRoomId(10L);
        request.setStartAt(startAt);
        request.setEndAt(endAt);

        when(roomRepository.findById(10L)).thenReturn(Optional.of(testRoom));
        when(bookingRepository.existsOverlappingBooking(10L, startAt, endAt)).thenReturn(true);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () ->
                bookingService.createBooking(request)
        );

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        verify(bookingRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve permitir cancelamento de reserva pelo dono com antecedência >= 24h")
    void shouldAllowCancelWhenNoticeIsGreaterThan24Hours() {
        Booking booking = new Booking();
        booking.setId(100L);
        booking.setUser(standardUser);
        booking.setRoom(testRoom);
        booking.setStartAt(LocalDateTime.now().plusHours(48));
        booking.setEndAt(LocalDateTime.now().plusHours(49));

        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));

        assertDoesNotThrow(() -> bookingService.cancelBooking(100L, standardUser));
        verify(bookingRepository, times(1)).delete(booking);
    }

    @Test
    @DisplayName("Deve proibir cancelamento por usuário comum com antecedência < 24h")
    void shouldThrowExceptionWhenUserCancelsUnder24HoursNotice() {
        Booking booking = new Booking();
        booking.setId(100L);
        booking.setUser(standardUser);
        booking.setRoom(testRoom);
        booking.setStartAt(LocalDateTime.now().plusHours(12));
        booking.setEndAt(LocalDateTime.now().plusHours(13));

        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () ->
                bookingService.cancelBooking(100L, standardUser)
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        verify(bookingRepository, never()).delete(any());
    }

    @Test
    @DisplayName("Deve permitir cancelamento imediato pelo Administrador independente do prazo")
    void shouldAllowAdminToCancelUnder24HoursNotice() {
        Booking booking = new Booking();
        booking.setId(100L);
        booking.setUser(standardUser);
        booking.setRoom(testRoom);
        booking.setStartAt(LocalDateTime.now().plusHours(2));
        booking.setEndAt(LocalDateTime.now().plusHours(3));

        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));

        assertDoesNotThrow(() -> bookingService.cancelBooking(100L, adminUser));
        verify(bookingRepository, times(1)).delete(booking);
    }

    @Test
    @DisplayName("Deve lançar FORBIDDEN quando usuário tentar cancelar reserva de terceiro")
    void shouldThrowForbiddenWhenCancellingOtherUserBooking() {
        User anotherUser = new User();
        anotherUser.setId(99L);
        anotherUser.setRole("USER");

        Booking booking = new Booking();
        booking.setId(100L);
        booking.setUser(anotherUser);
        booking.setRoom(testRoom);
        booking.setStartAt(LocalDateTime.now().plusHours(48));

        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () ->
                bookingService.cancelBooking(100L, standardUser)
        );

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatusCode());
        verify(bookingRepository, never()).delete(any());
    }
}
