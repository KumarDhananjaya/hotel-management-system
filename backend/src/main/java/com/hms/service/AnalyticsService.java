package com.hms.service;

import com.hms.model.Booking;
import com.hms.model.Payment;
import com.hms.model.Room;
import com.hms.repository.BookingRepository;
import com.hms.repository.PaymentRepository;
import com.hms.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class AnalyticsService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private HotelMetricsService metricsService;

    /**
     * Get comprehensive hotel analytics for a date range
     */
    public Map<String, Object> getHotelAnalytics(LocalDate startDate, LocalDate endDate) {
        Map<String, Object> analytics = new HashMap<>();

        // Get all bookings in range
        List<Booking> bookings = bookingRepository.findByCheckInDateBetween(startDate, endDate);

        // Get all payments
        List<Payment> payments = new ArrayList<>();
        for (Booking booking : bookings) {
            payments.addAll(paymentRepository.findByBookingId(booking.getId()));
        }

        // Calculate basic metrics
        int totalRooms = (int) roomRepository.count();
        int daysInPeriod = (int) ChronoUnit.DAYS.between(startDate, endDate) + 1;
        int totalAvailableRooms = totalRooms * daysInPeriod;
        int roomsSold = bookings.size();

        // Calculate revenue with null safety
        BigDecimal totalRoomRevenue = BigDecimal.ZERO;
        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal totalTaxes = BigDecimal.ZERO;

        for (Payment p : payments) {
            if (p.getSubtotal() != null) {
                totalRoomRevenue = totalRoomRevenue.add(p.getSubtotal());
            }
            if (p.getAmount() != null) {
                totalRevenue = totalRevenue.add(p.getAmount());
            }
            BigDecimal stateTax = p.getStateTax() != null ? p.getStateTax() : BigDecimal.ZERO;
            BigDecimal countyTax = p.getCountyTax() != null ? p.getCountyTax() : BigDecimal.ZERO;
            BigDecimal cityTax = p.getCityTax() != null ? p.getCityTax() : BigDecimal.ZERO;
            totalTaxes = totalTaxes.add(stateTax).add(countyTax).add(cityTax);
        }

        // Calculate U.S. Hotel Metrics
        BigDecimal adr = metricsService.calculateADR(totalRoomRevenue, roomsSold);
        BigDecimal revpar = metricsService.calculateRevPAR(totalRoomRevenue, totalAvailableRooms);
        BigDecimal revpor = metricsService.calculateRevPOR(totalRevenue, roomsSold);
        BigDecimal occupancyRate = metricsService.calculateOccupancyRate(roomsSold, totalAvailableRooms);

        // Calculate average length of stay
        int totalNights = bookings.stream()
                .mapToInt(b -> (int) ChronoUnit.DAYS.between(b.getCheckInDate(), b.getCheckOutDate()))
                .sum();
        BigDecimal alos = metricsService.calculateALOS(totalNights, roomsSold);

        // Populate analytics
        analytics.put("period", Map.of(
                "startDate", startDate.toString(),
                "endDate", endDate.toString(),
                "days", daysInPeriod));

        analytics.put("revenue", Map.of(
                "totalRevenue", totalRevenue,
                "totalRoomRevenue", totalRoomRevenue,
                "totalTaxes", totalTaxes,
                "averageBookingValue",
                roomsSold > 0 ? totalRevenue.divide(new BigDecimal(roomsSold), 2, RoundingMode.HALF_UP)
                        : BigDecimal.ZERO));

        analytics.put("occupancy", Map.of(
                "totalRooms", totalRooms,
                "totalAvailableRooms", totalAvailableRooms,
                "roomsSold", roomsSold,
                "occupancyRate", occupancyRate));

        analytics.put("usHotelMetrics", Map.of(
                "adr", adr,
                "revpar", revpar,
                "revpor", revpor,
                "alos", alos));

        analytics.put("bookings", Map.of(
                "totalBookings", roomsSold,
                "averageLengthOfStay", alos));

        return analytics;
    }

    /**
     * Get daily revenue breakdown for charts
     */
    public List<Map<String, Object>> getDailyRevenue(LocalDate startDate, LocalDate endDate) {
        List<Map<String, Object>> dailyData = new ArrayList<>();

        LocalDate currentDate = startDate;
        while (!currentDate.isAfter(endDate)) {
            LocalDate nextDate = currentDate.plusDays(1);

            List<Booking> dayBookings = bookingRepository.findByCheckInDateBetween(currentDate, currentDate);

            BigDecimal dayRevenue = BigDecimal.ZERO;
            for (Booking booking : dayBookings) {
                List<Payment> payments = paymentRepository.findByBookingId(booking.getId());
                dayRevenue = dayRevenue.add(
                        payments.stream()
                                .map(p -> Optional.ofNullable(p.getAmount()).orElse(BigDecimal.ZERO))
                                .reduce(BigDecimal.ZERO, BigDecimal::add));
            }

            Map<String, Object> dayData = new HashMap<>();
            dayData.put("date", currentDate.toString());
            dayData.put("revenue", dayRevenue);
            dayData.put("bookings", dayBookings.size());
            dailyData.add(dayData);

            currentDate = nextDate;
        }

        return dailyData;
    }

    /**
     * Get room type performance
     */
    public List<Map<String, Object>> getRoomTypePerformance() {
        List<Map<String, Object>> performance = new ArrayList<>();

        for (Room.RoomType type : Room.RoomType.values()) {
            List<Room> rooms = roomRepository.findByType(type);

            int totalRooms = rooms.size();
            int bookedRooms = 0;
            BigDecimal revenue = BigDecimal.ZERO;

            for (Room room : rooms) {
                List<Booking> bookings = bookingRepository.findByRoomId(room.getId());
                bookedRooms += bookings.size();

                for (Booking booking : bookings) {
                    List<Payment> payments = paymentRepository.findByBookingId(booking.getId());
                    revenue = revenue.add(
                            payments.stream()
                                    .map(p -> Optional.ofNullable(p.getAmount()).orElse(BigDecimal.ZERO))
                                    .reduce(BigDecimal.ZERO, BigDecimal::add));
                }
            }

            Map<String, Object> typeData = new HashMap<>();
            typeData.put("roomType", type.toString());
            typeData.put("totalRooms", totalRooms);
            typeData.put("bookings", bookedRooms);
            typeData.put("revenue", revenue);
            typeData.put("averageRevenue",
                    bookedRooms > 0 ? revenue.divide(new BigDecimal(bookedRooms), 2, RoundingMode.HALF_UP)
                            : BigDecimal.ZERO);

            performance.add(typeData);
        }

        return performance;
    }

    /**
     * Get monthly comparison
     */
    public Map<String, Object> getMonthlyComparison(int year, int month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);

        LocalDate prevStartDate = startDate.minusMonths(1);
        LocalDate prevEndDate = prevStartDate.plusMonths(1).minusDays(1);

        Map<String, Object> currentMonth = getHotelAnalytics(startDate, endDate);
        Map<String, Object> previousMonth = getHotelAnalytics(prevStartDate, prevEndDate);

        Map<String, Object> comparison = new HashMap<>();
        comparison.put("currentMonth", currentMonth);
        comparison.put("previousMonth", previousMonth);

        return comparison;
    }
}
