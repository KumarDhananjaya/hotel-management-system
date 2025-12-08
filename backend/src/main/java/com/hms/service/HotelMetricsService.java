package com.hms.service;

import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * U.S. Hotel Industry Metrics Service
 * Implements standard hotel performance indicators used in the American
 * hospitality industry
 */
@Service
public class HotelMetricsService {

    /**
     * ADR - Average Daily Rate
     * Formula: Total Room Revenue / Number of Rooms Sold
     * 
     * This metric shows the average rental income per occupied room.
     * Industry benchmark: $100-$300 depending on market segment
     * 
     * @param totalRoomRevenue Total revenue from room sales
     * @param roomsSold        Number of rooms sold during the period
     * @return Average daily rate
     */
    public BigDecimal calculateADR(BigDecimal totalRoomRevenue, int roomsSold) {
        if (roomsSold == 0)
            return BigDecimal.ZERO;
        return totalRoomRevenue.divide(
                new BigDecimal(roomsSold),
                2,
                RoundingMode.HALF_UP);
    }

    /**
     * RevPAR - Revenue Per Available Room
     * Formula: Total Room Revenue / Total Available Rooms
     * OR: ADR × Occupancy Rate
     * 
     * This is the most important metric in hotel revenue management.
     * It combines both occupancy and rate performance.
     * Industry benchmark: $50-$200 depending on market
     * 
     * @param totalRoomRevenue    Total revenue from room sales
     * @param totalAvailableRooms Total rooms available (rooms × days)
     * @return Revenue per available room
     */
    public BigDecimal calculateRevPAR(BigDecimal totalRoomRevenue, int totalAvailableRooms) {
        if (totalAvailableRooms == 0)
            return BigDecimal.ZERO;
        return totalRoomRevenue.divide(
                new BigDecimal(totalAvailableRooms),
                2,
                RoundingMode.HALF_UP);
    }

    /**
     * RevPOR - Revenue Per Occupied Room
     * Formula: Total Revenue (including ancillary) / Rooms Sold
     * 
     * This metric includes all revenue streams (F&B, services, amenities)
     * Shows total guest spending per occupied room.
     * 
     * @param totalRevenue Total revenue including room, F&B, services
     * @param roomsSold    Number of rooms sold
     * @return Revenue per occupied room
     */
    public BigDecimal calculateRevPOR(BigDecimal totalRevenue, int roomsSold) {
        if (roomsSold == 0)
            return BigDecimal.ZERO;
        return totalRevenue.divide(
                new BigDecimal(roomsSold),
                2,
                RoundingMode.HALF_UP);
    }

    /**
     * Occupancy Rate
     * Formula: (Rooms Sold / Total Available Rooms) × 100
     * 
     * Percentage of available rooms that are occupied.
     * Industry benchmark: 60-80% depending on market and season
     * 
     * @param roomsSold           Number of rooms sold
     * @param totalAvailableRooms Total rooms available
     * @return Occupancy rate as percentage
     */
    public BigDecimal calculateOccupancyRate(int roomsSold, int totalAvailableRooms) {
        if (totalAvailableRooms == 0)
            return BigDecimal.ZERO;
        return new BigDecimal(roomsSold)
                .divide(new BigDecimal(totalAvailableRooms), 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"))
                .setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * GOPPAR - Gross Operating Profit Per Available Room
     * Formula: Gross Operating Profit / Total Available Rooms
     * 
     * Shows profitability per available room after operating expenses.
     * 
     * @param grossOperatingProfit Total profit after operating expenses
     * @param totalAvailableRooms  Total rooms available
     * @return GOPPAR
     */
    public BigDecimal calculateGOPPAR(BigDecimal grossOperatingProfit, int totalAvailableRooms) {
        if (totalAvailableRooms == 0)
            return BigDecimal.ZERO;
        return grossOperatingProfit.divide(
                new BigDecimal(totalAvailableRooms),
                2,
                RoundingMode.HALF_UP);
    }

    /**
     * TRevPAR - Total Revenue Per Available Room
     * Formula: Total Property Revenue / Total Available Rooms
     * 
     * Includes all revenue sources (rooms, F&B, parking, spa, etc.)
     * 
     * @param totalPropertyRevenue All revenue from all sources
     * @param totalAvailableRooms  Total rooms available
     * @return TRevPAR
     */
    public BigDecimal calculateTRevPAR(BigDecimal totalPropertyRevenue, int totalAvailableRooms) {
        if (totalAvailableRooms == 0)
            return BigDecimal.ZERO;
        return totalPropertyRevenue.divide(
                new BigDecimal(totalAvailableRooms),
                2,
                RoundingMode.HALF_UP);
    }

    /**
     * Average Length of Stay (ALOS)
     * Formula: Total Room Nights / Number of Reservations
     * 
     * @param totalRoomNights      Total nights stayed
     * @param numberOfReservations Total number of bookings
     * @return Average length of stay
     */
    public BigDecimal calculateALOS(int totalRoomNights, int numberOfReservations) {
        if (numberOfReservations == 0)
            return BigDecimal.ZERO;
        return new BigDecimal(totalRoomNights)
                .divide(new BigDecimal(numberOfReservations), 2, RoundingMode.HALF_UP);
    }

    /**
     * Market Penetration Index (MPI)
     * Formula: (Hotel Occupancy / Market Occupancy) × 100
     * 
     * Shows how well the hotel is capturing market share.
     * > 100 = outperforming market
     * < 100 = underperforming market
     * 
     * @param hotelOccupancy  Hotel's occupancy rate
     * @param marketOccupancy Competitive set's average occupancy
     * @return MPI
     */
    public BigDecimal calculateMPI(BigDecimal hotelOccupancy, BigDecimal marketOccupancy) {
        if (marketOccupancy.compareTo(BigDecimal.ZERO) == 0)
            return BigDecimal.ZERO;
        return hotelOccupancy
                .divide(marketOccupancy, 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"))
                .setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Revenue Generation Index (RGI)
     * Formula: (Hotel RevPAR / Market RevPAR) × 100
     * 
     * Shows revenue performance relative to competition.
     * > 100 = outperforming market
     * 
     * @param hotelRevPAR  Hotel's RevPAR
     * @param marketRevPAR Competitive set's average RevPAR
     * @return RGI
     */
    public BigDecimal calculateRGI(BigDecimal hotelRevPAR, BigDecimal marketRevPAR) {
        if (marketRevPAR.compareTo(BigDecimal.ZERO) == 0)
            return BigDecimal.ZERO;
        return hotelRevPAR
                .divide(marketRevPAR, 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"))
                .setScale(2, RoundingMode.HALF_UP);
    }
}
