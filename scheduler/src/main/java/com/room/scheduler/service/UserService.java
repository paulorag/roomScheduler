package com.room.scheduler.service;

import com.room.scheduler.dto.UpdateRoleRequest;
import com.room.scheduler.dto.UserResponse;
import com.room.scheduler.model.User;
import com.room.scheduler.repository.BookingRepository;
import com.room.scheduler.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class UserService {
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;

    public UserService(UserRepository userRepository, BookingRepository bookingRepository) {
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
    }

    public List<UserResponse> listAll() {
        return userRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado");
        }

        if (bookingRepository.existsByUserId(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Não é possível excluir o usuário pois existem reservas vinculadas.");
        }

        userRepository.deleteById(id);
    }

    @Transactional
    public void updateRole(Long id, UpdateRoleRequest request) {
        if (request.role() == null || (!request.role().equals("ADMIN") && !request.role().equals("USER"))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role inválida. Utilize ADMIN ou USER.");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));

        user.setRole(request.role());
        userRepository.save(user);
    }

    private UserResponse mapToResponse(User user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole());
    }
}
