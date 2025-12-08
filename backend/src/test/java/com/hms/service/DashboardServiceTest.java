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
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class DashboardServiceTest {

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private BookingRepository bookingRepository;

    @InjectMocks
    private DashboardService dashboardService;

    @Test
    void testGetAnalytics() {
        // Arrange
        Room room1 = new Room();
        room1.setType(Room.RoomType.SINGLE);
        room1.setStatus(Room.RoomStatus.BOOKED);

        Room room2 = new Room();
        room2.setType(Room.RoomType.DOUBLE);
        room2.setStatus(Room.RoomStatus.AVAILABLE);

        Booking booking = new Booking();
        booking.setStatus(Booking.BookingStatus.CONFIRMED);
        booking.setTotalAmount(new BigDecimal("100.00"));
        booking.setCheckInDate(LocalDate.now());
        booking.setCreatedAt(LocalDateTime.now());

        when(roomRepository.count()).thenReturn(2L);
        when(bookingRepository.count()).thenReturn(1L);
        when(roomRepository.findByStatus(Room.RoomStatus.AVAILABLE)).thenReturn(Arrays.asList(room2));
        when(bookingRepository.findAll()).thenReturn(Arrays.asList(booking));
        when(roomRepository.findAll()).thenReturn(Arrays.asList(room1, room2));

        // Act
        Map<String, Object> stats = dashboardService.getAnalytics();

        // Assert
        assertEquals(2L, stats.get("totalRooms"));
        assertEquals(1L, stats.get("totalBookings"));
        assertEquals(1L, stats.get("availableRooms"));
        assertEquals(new BigDecimal("100.00"), stats.get("totalRevenue"));

        // Verify Chart Data
        List<Map<String, Object>> revenueChart = (List<Map<String, Object>>) stats.get("revenueChart");
        assertNotNull(revenueChart);
        assertEquals(7, revenueChart.size());

        List<Map<String, Object>> occupancyChart = (List<Map<String, Object>>) stats.get("occupancyChart");
        assertNotNull(occupancyChart);
        // Should have SINGLE (1) and AVAILABLE (1)
        assertTrue(occupancyChart.stream().anyMatch(m -> m.get("name").equals("SINGLE") && (long) m.get("value") == 1));
        assertTrue(
                occupancyChart.stream().anyMatch(m -> m.get("name").equals("AVAILABLE") && (long) m.get("value") == 1));
    }
}
