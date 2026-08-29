package com.room.scheduler.service;

import com.room.scheduler.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class TokenServiceTest {

    private TokenService tokenService;

    @BeforeEach
    void setUp() {
        tokenService = new TokenService();
        ReflectionTestUtils.setField(tokenService, "secret", "uma-chave-secreta-forte-com-mais-de-32-caracteres");
        tokenService.validateSecret();
    }

    @Test
    void shouldGenerateAndValidateTokenSuccessfully() {
        User user = new User();
        user.setEmail("test@room.com");
        user.setRole("USER");

        String token = tokenService.generateToken(user);
        assertNotNull(token);
        assertFalse(token.isEmpty());

        String subject = tokenService.validateToken(token);
        assertEquals("test@room.com", subject);
    }

    @Test
    void shouldFallbackWhenSecretIsNull() {
        TokenService fallbackService = new TokenService();
        ReflectionTestUtils.setField(fallbackService, "secret", null);

        assertDoesNotThrow(fallbackService::validateSecret);
    }

    @Test
    void shouldAcceptCustomSecret() {
        TokenService customService = new TokenService();
        ReflectionTestUtils.setField(customService, "secret", "minha-chave-customizada");

        assertDoesNotThrow(customService::validateSecret);
    }

    @Test
    void shouldReturnEmptyStringForInvalidToken() {
        String result = tokenService.validateToken("token-invalido-qualquer");
        assertEquals("", result);
    }
}
