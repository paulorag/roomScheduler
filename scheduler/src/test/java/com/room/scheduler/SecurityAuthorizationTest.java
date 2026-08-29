package com.room.scheduler;

import com.room.scheduler.model.Booking;
import com.room.scheduler.model.Room;
import com.room.scheduler.model.User;
import com.room.scheduler.service.BookingService;
import com.room.scheduler.service.CalendarExportService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageImpl;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
public class SecurityAuthorizationTest {

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;

    @MockitoBean
    private BookingService bookingService;

    @MockitoBean
    private CalendarExportService calendarExportService;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();
    }

    @Test
    @WithMockUser(username = "user@test.com", roles = {"USER"})
    @DisplayName("USER não deve conseguir acessar listagem paginada global de reservas (403 FORBIDDEN)")
    void userShouldBeForbiddenFromAccessingGlobalPagedBookings() throws Exception {
        mockMvc.perform(get("/api/bookings/page"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin@test.com", roles = {"ADMIN"})
    @DisplayName("ADMIN deve conseguir acessar listagem paginada global de reservas (200 OK)")
    void adminShouldBeAllowedToAccessGlobalPagedBookings() throws Exception {
        when(bookingService.listAllPaged(any())).thenReturn(new PageImpl<>(List.of()));

        mockMvc.perform(get("/api/bookings/page"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "user@test.com", roles = {"USER"})
    @DisplayName("USER não deve conseguir acessar listagem completa global de reservas (403 FORBIDDEN)")
    void userShouldBeForbiddenFromAccessingGlobalBookings() throws Exception {
        mockMvc.perform(get("/api/bookings"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin@test.com", roles = {"ADMIN"})
    @DisplayName("ADMIN deve conseguir acessar listagem completa global de reservas (200 OK)")
    void adminShouldBeAllowedToAccessGlobalBookings() throws Exception {
        when(bookingService.listAll()).thenReturn(List.of());

        mockMvc.perform(get("/api/bookings"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Usuário anônimo não autenticado deve ser rejeitado ao tentar baixar .ics (401/403)")
    void unauthenticatedUserShouldBeForbiddenFromExportingIcs() throws Exception {
        mockMvc.perform(get("/api/bookings/1/ics"))
                .andExpect(status().isForbidden());
    }
}
