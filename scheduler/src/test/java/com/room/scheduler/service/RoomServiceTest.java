package com.room.scheduler.service;

import com.room.scheduler.dto.RoomRequest;
import com.room.scheduler.model.Room;
import com.room.scheduler.repository.BookingRepository;
import com.room.scheduler.repository.RoomRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class RoomServiceTest {

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private BookingRepository bookingRepository;

    @InjectMocks
    private RoomService roomService;

    @Test
    @DisplayName("Deve criar sala com sucesso")
    void shouldCreateRoomSuccessfully() {
        RoomRequest request = new RoomRequest();
        request.setName("Auditório");
        request.setCapacity(50);

        Room savedRoom = new Room();
        savedRoom.setId(1L);
        savedRoom.setName("Auditório");
        savedRoom.setCapacity(50);

        when(roomRepository.save(any(Room.class))).thenReturn(savedRoom);

        Room result = roomService.createRoom(request);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Auditório", result.getName());
        assertEquals(50, result.getCapacity());
        verify(roomRepository, times(1)).save(any(Room.class));
    }

    @Test
    @DisplayName("Deve listar todas as salas")
    void shouldListAllRooms() {
        Room room1 = new Room();
        room1.setId(1L);
        room1.setName("Sala 1");
        room1.setCapacity(5);

        Room room2 = new Room();
        room2.setId(2L);
        room2.setName("Sala 2");
        room2.setCapacity(10);

        when(roomRepository.findAll()).thenReturn(List.of(room1, room2));

        List<Room> result = roomService.listAll();

        assertEquals(2, result.size());
        verify(roomRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Deve atualizar sala com sucesso")
    void shouldUpdateRoomSuccessfully() {
        Room existingRoom = new Room();
        existingRoom.setId(1L);
        existingRoom.setName("Nome Antigo");
        existingRoom.setCapacity(10);

        RoomRequest updateRequest = new RoomRequest();
        updateRequest.setName("Nome Novo");
        updateRequest.setCapacity(20);

        when(roomRepository.findById(1L)).thenReturn(Optional.of(existingRoom));
        when(roomRepository.save(any(Room.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Room updated = roomService.updateRoom(1L, updateRequest);

        assertEquals("Nome Novo", updated.getName());
        assertEquals(20, updated.getCapacity());
    }

    @Test
    @DisplayName("Deve lançar NOT_FOUND ao atualizar sala inexistente")
    void shouldThrowNotFoundWhenUpdatingMissingRoom() {
        RoomRequest updateRequest = new RoomRequest();
        updateRequest.setName("Nome");
        updateRequest.setCapacity(10);

        when(roomRepository.findById(99L)).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () ->
                roomService.updateRoom(99L, updateRequest)
        );

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
    }

    @Test
    @DisplayName("Deve excluir sala sem reservas com sucesso")
    void shouldDeleteRoomSuccessfully() {
        when(roomRepository.existsById(1L)).thenReturn(true);
        when(bookingRepository.existsByRoomId(1L)).thenReturn(false);

        assertDoesNotThrow(() -> roomService.delete(1L));
        verify(roomRepository, times(1)).deleteById(1L);
    }

    @Test
    @DisplayName("Deve lançar CONFLICT ao tentar excluir sala com reservas vinculadas")
    void shouldThrowConflictWhenDeletingRoomWithBookings() {
        when(roomRepository.existsById(1L)).thenReturn(true);
        when(bookingRepository.existsByRoomId(1L)).thenReturn(true);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () ->
                roomService.delete(1L)
        );

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        verify(roomRepository, never()).deleteById(any());
    }

    @Test
    @DisplayName("Deve lançar NOT_FOUND ao tentar excluir sala inexistente")
    void shouldThrowNotFoundWhenDeletingMissingRoom() {
        when(roomRepository.existsById(99L)).thenReturn(false);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () ->
                roomService.delete(99L)
        );

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
        verify(roomRepository, never()).deleteById(any());
    }
}
