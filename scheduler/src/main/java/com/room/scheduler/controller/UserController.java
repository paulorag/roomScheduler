package com.room.scheduler.controller;

import com.room.scheduler.dto.UpdateRoleRequest;
import com.room.scheduler.dto.UserResponse;
import com.room.scheduler.service.UserService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<UserResponse> listAll() {
        return userService.listAll();
    }

    @GetMapping("/page")
    public Page<UserResponse> listAllPaged(@PageableDefault(size = 10) Pageable pageable) {
        return userService.listAllPaged(pageable);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/role")
    public ResponseEntity<Void> updateRole(@PathVariable Long id, @RequestBody @Valid UpdateRoleRequest request) {
        userService.updateRole(id, request);
        return ResponseEntity.ok().build();
    }
}