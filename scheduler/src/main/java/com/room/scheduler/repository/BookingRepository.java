package com.room.scheduler.repository;

import com.room.scheduler.model.Booking;

import java.time.LocalDateTime;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    @Query("""
                SELECT COUNT(b) > 0
                FROM Booking b
                WHERE b.room.id = :roomId
                AND (b.startAt < :endAt AND b.endAt > :startAt)
            """)
    boolean existsOverlappingBooking(
            @Param("roomId") Long roomId,
            @Param("startAt") LocalDateTime startAt,
            @Param("endAt") LocalDateTime endAt);
}
