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
        stats.put("occupancyRate", totalRooms > 0 ? (double) (totalRooms - availableCount) / totalRooms * 100 : 0);
        stats.put("totalRevenue", totalRevenue);
        stats.put("todayCheckIns", todayCheckIns);

        // Chart Data: Revenue Last 7 Days
        List<Map<String, Object>> revenueChart = new java.util.ArrayList<>();
        LocalDate today = LocalDate.now();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            BigDecimal dailyRevenue = bookingRepository.findAll().stream()
                    .filter(b -> b.getStatus() == Booking.BookingStatus.CONFIRMED
                            && b.getCreatedAt().toLocalDate().equals(date))
                    .map(Booking::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            Map<String, Object> dataPoint = new HashMap<>();
            dataPoint.put("date", date.toString());
            dataPoint.put("revenue", dailyRevenue);
            revenueChart.add(dataPoint);
        }
        stats.put("revenueChart", revenueChart);

        // Chart Data: Occupancy by Room Type
        Map<String, Long> occupancyByType = roomRepository.findAll().stream()
                .filter(r -> r.getStatus() == Room.RoomStatus.BOOKED)
                .collect(java.util.stream.Collectors.groupingBy(r -> r.getType().name(),
                        java.util.stream.Collectors.counting()));

        List<Map<String, Object>> occupancyChart = new java.util.ArrayList<>();
        occupancyByType.forEach((type, count) -> {
            Map<String, Object> item = new HashMap<>();
            item.put("name", type);
            item.put("value", count);
            occupancyChart.add(item);
        });
        // Add available as a slice
        Map<String, Object> availableItem = new HashMap<>();
        availableItem.put("name", "AVAILABLE");
        availableItem.put("value", availableCount);
        occupancyChart.add(availableItem);

        stats.put("occupancyChart", occupancyChart);

        return stats;
    }
}
