package com.hms.service;

import com.hms.model.Booking;
import com.hms.model.Room;
import com.hms.repository.BookingRepository;
import com.hms.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private BookingRepository bookingRepository;

    public Map<String, Object> getAnalytics() {
        Map<String, Object> stats = new HashMap<>();
        
        long totalRooms = roomRepository.count();
        long totalBookings = bookingRepository.count();
        
        List<Room> availableRooms = roomRepository.findByStatus(Room.RoomStatus.AVAILABLE);
        long availableCount = availableRooms.size();
        
        BigDecimal totalRevenue = bookingRepository.findAll().stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.CONFIRMED)
                .map(Booking::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long todayCheckIns = bookingRepository.findAll().stream()
                .filter(b -> b.getCheckInDate().equals(LocalDate.now()))
                .count();

        stats.put("totalRooms", totalRooms);
        stats.put("totalBookings", totalBookings);
        stats.put("availableRooms", availableCount);
        stats.put("occupancyRate", totalRooms > 0 ? (double)(totalRooms - availableCount) / totalRooms * 100 : 0);
        stats.put("totalRevenue", totalRevenue);
        stats.put("todayCheckIns", todayCheckIns);
        
        return stats;
    }
}
