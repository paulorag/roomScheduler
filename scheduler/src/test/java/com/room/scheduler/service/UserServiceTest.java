package com.room.scheduler.service;

import com.room.scheduler.dto.UpdateRoleRequest;
import com.room.scheduler.dto.UserResponse;
import com.room.scheduler.model.User;
import com.room.scheduler.repository.BookingRepository;
import com.room.scheduler.repository.UserRepository;
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
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private BookingRepository bookingRepository;

    @InjectMocks
    private UserService userService;

    @Test
    @DisplayName("Deve listar todos os usuários")
    void shouldListAllUsers() {
        User u1 = new User();
        u1.setId(1L);
        u1.setName("Alice");
        u1.setEmail("alice@test.com");
        u1.setRole("ADMIN");

        User u2 = new User();
        u2.setId(2L);
        u2.setName("Bob");
        u2.setEmail("bob@test.com");
        u2.setRole("USER");

        when(userRepository.findAll()).thenReturn(List.of(u1, u2));

        List<UserResponse> users = userService.listAll();

        assertEquals(2, users.size());
        assertEquals("Alice", users.get(0).name());
        assertEquals("Bob", users.get(1).name());
    }

    @Test
    @DisplayName("Deve atualizar role do usuário com sucesso")
    void shouldUpdateUserRoleSuccessfully() {
        User user = new User();
        user.setId(1L);
        user.setName("Alice");
        user.setEmail("alice@test.com");
        user.setRole("USER");

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        assertDoesNotThrow(() -> userService.updateRole(1L, new UpdateRoleRequest("ADMIN")));
        assertEquals("ADMIN", user.getRole());
        verify(userRepository, times(1)).save(user);
    }

    @Test
    @DisplayName("Deve lançar BAD_REQUEST para role inválida")
    void shouldThrowBadRequestForInvalidRole() {
        assertThrows(ResponseStatusException.class, () ->
                userService.updateRole(1L, new UpdateRoleRequest("SUPER_USER"))
        );
        verify(userRepository, never()).findById(any());
    }

    @Test
    @DisplayName("Deve excluir usuário sem reservas com sucesso")
    void shouldDeleteUserSuccessfully() {
        when(userRepository.existsById(1L)).thenReturn(true);
        when(bookingRepository.existsByUserId(1L)).thenReturn(false);

        assertDoesNotThrow(() -> userService.deleteUser(1L));
        verify(userRepository, times(1)).deleteById(1L);
    }

    @Test
    @DisplayName("Deve lançar CONFLICT ao tentar excluir usuário com reservas")
    void shouldThrowConflictWhenDeletingUserWithBookings() {
        when(userRepository.existsById(1L)).thenReturn(true);
        when(bookingRepository.existsByUserId(1L)).thenReturn(true);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () ->
                userService.deleteUser(1L)
        );

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        verify(userRepository, never()).deleteById(any());
    }
}
