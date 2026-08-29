package com.room.scheduler.service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.room.scheduler.model.User;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
public class TokenService {

    private static final Logger log = LoggerFactory.getLogger(TokenService.class);
    private static final String DEFAULT_INSECURE_SECRET = "minha-chave-secreta-padrao-local";

    @Value("${api.security.token.secret:minha-chave-secreta-padrao-local}")
    private String secret;

    @PostConstruct
    public void validateSecret() {
        if (secret == null || secret.trim().isEmpty()) {
            secret = DEFAULT_INSECURE_SECRET;
            log.warn("JWT_SECRET ausente. Utilizando chave padrão.");
        } else if (secret.trim().length() < 32) {
            log.warn("ATENÇÃO: JWT_SECRET configurada possui menos de 32 caracteres. Recomenda-se utilizar uma chave com 32+ caracteres para maior segurança.");
        }
        if (DEFAULT_INSECURE_SECRET.equals(secret.trim())) {
            log.warn("ATENÇÃO: Utilizando segredo JWT padrão de desenvolvimento. Configure a variável de ambiente JWT_SECRET com um segredo forte em produção.");
        }
    }

    public String generateToken(User user) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            return JWT.create()
                    .withIssuer("auth-api")
                    .withSubject(user.getEmail())
                    .withClaim("role", user.getRole())
                    .withExpiresAt(genExpirationDate())
                    .sign(algorithm);
        } catch (JWTCreationException exception) {
            throw new RuntimeException("Erro ao gerar token JWT", exception);
        }
    }

    public String validateToken(String token) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            return JWT.require(algorithm)
                    .withIssuer("auth-api")
                    .build()
                    .verify(token)
                    .getSubject();
        } catch (JWTVerificationException exception) {
            return "";
        }
    }

    private Instant genExpirationDate() {
        return Instant.now().plus(2, ChronoUnit.HOURS);
    }
}
