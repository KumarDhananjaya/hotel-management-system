package com.hms.repository;

import com.hms.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByGuestId(Long guestId);

    List<Booking> findByRoomId(Long roomId);

    List<Booking> findByStatus(Booking.BookingStatus status);

    // Find bookings that overlap with the given date range for a specific room
    // Overlap logic: (StartA < EndB) and (EndA > StartB)
    @org.springframework.data.jpa.repository.Query("SELECT b FROM Booking b WHERE b.room.id = :roomId AND b.status <> 'CANCELLED' AND b.checkInDate < :checkOutDate AND b.checkOutDate > :checkInDate")
    List<Booking> findBookingsInDateRange(@org.springframework.data.repository.query.Param("roomId") Long roomId,
            @org.springframework.data.repository.query.Param("checkInDate") java.time.LocalDate checkInDate,
            @org.springframework.data.repository.query.Param("checkOutDate") java.time.LocalDate checkOutDate);

    List<Booking> findByCheckInDateBetween(java.time.LocalDate startDate, java.time.LocalDate endDate);
}
