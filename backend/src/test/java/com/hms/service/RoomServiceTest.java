package com.hms.service;

import com.hms.model.Booking;
import com.hms.model.Room;
import com.hms.repository.BookingRepository;
import com.hms.repository.RoomRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class RoomServiceTest {

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private BookingRepository bookingRepository;

    @InjectMocks
    private RoomService roomService;

    private Room room1;
    private Room room2;

    @BeforeEach
    void setUp() {
        room1 = new Room(1L, "101", Room.RoomType.SINGLE, new BigDecimal("100.00"), Room.RoomStatus.AVAILABLE,
                "Single Room");
        room2 = new Room(2L, "102", Room.RoomType.DOUBLE, new BigDecimal("150.00"), Room.RoomStatus.MAINTENANCE,
                "Double Room");
    }

    @Test
    void testFindAvailableRooms_NoConflicts() {
        // Arrange
        LocalDate checkIn = LocalDate.of(2023, 10, 1);
        LocalDate checkOut = LocalDate.of(2023, 10, 5);

        when(roomRepository.findAll()).thenReturn(Arrays.asList(room1, room2));
        // room1 has no conflicts
        when(bookingRepository.findBookingsInDateRange(1L, checkIn, checkOut)).thenReturn(Collections.emptyList());

        // Act
        List<Room> result = roomService.findAvailableRooms(checkIn, checkOut, null);

        // Assert
        assertEquals(1, result.size());
        assertEquals("101", result.get(0).getRoomNumber());
    }

    @Test
    void testFindAvailableRooms_WithConflicts() {
        // Arrange
        LocalDate checkIn = LocalDate.of(2023, 10, 1);
        LocalDate checkOut = LocalDate.of(2023, 10, 5);

        when(roomRepository.findAll()).thenReturn(Arrays.asList(room1));
        // room1 has a conflict
        when(bookingRepository.findBookingsInDateRange(1L, checkIn, checkOut)).thenReturn(Arrays.asList(new Booking()));

        // Act
        List<Room> result = roomService.findAvailableRooms(checkIn, checkOut, null);

        // Assert
        assertTrue(result.isEmpty());
    }

    @Test
    void testFindAvailableRooms_WithTypeFilter() {
        // Arrange
        LocalDate checkIn = LocalDate.of(2023, 10, 1);
        LocalDate checkOut = LocalDate.of(2023, 10, 5);

        when(roomRepository.findAll()).thenReturn(Arrays.asList(room1));
        // bookingRepository stub not needed as we filter by type first

        // Act
        List<Room> result = roomService.findAvailableRooms(checkIn, checkOut, Room.RoomType.DOUBLE);

        // Assert
        assertTrue(result.isEmpty(), "Should be empty because room1 is SINGLE and we asked for DOUBLE");
    }
}
