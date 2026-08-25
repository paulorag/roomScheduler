package com.room.scheduler.repository;

import com.room.scheduler.model.Booking;
import com.room.scheduler.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

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

    List<Booking> findByUserOrderByStartAtDesc(User user);

    Page<Booking> findByUserOrderByStartAtDesc(User user, Pageable pageable);

    Page<Booking> findAllByOrderByStartAtDesc(Pageable pageable);

    boolean existsByRoomId(Long roomId);

    boolean existsByUserId(Long userId);
}
