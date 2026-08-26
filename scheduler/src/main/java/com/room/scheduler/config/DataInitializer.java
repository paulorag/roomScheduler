package com.room.scheduler.config;

import com.room.scheduler.model.Room;
import com.room.scheduler.model.User;
import com.room.scheduler.repository.RoomRepository;
import com.room.scheduler.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email:admin@room.com}")
    private String adminEmail;

    @Value("${app.admin.password:Admin@12345}")
    private String adminPassword;

    @Value("${app.admin.name:Administrador}")
    private String adminName;

    public DataInitializer(UserRepository userRepository, RoomRepository roomRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roomRepository = roomRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedAdminUser();
        seedDefaultRooms();
    }

    private void seedAdminUser() {
        if (userRepository.findByEmail(adminEmail).isEmpty()) {
            User admin = new User();
            admin.setName(adminName);
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setRole("ADMIN");
            userRepository.save(admin);
            log.info("Conta de administrador inicial criada com sucesso: {}", adminEmail);
        }
    }

    private void seedDefaultRooms() {
        if (roomRepository.count() == 0) {
            Room r1 = new Room();
            r1.setName("Sala Reunião Alpha");
            r1.setCapacity(10);

            Room r2 = new Room();
            r2.setName("Auditório Principal");
            r2.setCapacity(50);

            Room r3 = new Room();
            r3.setName("Sala Brainstorming");
            r3.setCapacity(6);

            roomRepository.saveAll(List.of(r1, r2, r3));
            log.info("Salas padrão inicializadas com sucesso.");
        }
    }
}
