package com.hms.service;

import com.hms.model.Booking;
import com.hms.model.Room;
import com.hms.model.Guest;
import com.hms.repository.BookingRepository;
import com.hms.repository.GuestRepository;
import com.hms.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private GuestRepository guestRepository;

    @Autowired
    private EmailService emailService;

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Booking createBooking(Booking booking) {
        // Check if room is available
        Room room = roomRepository.findById(booking.getRoom().getId())
                .orElseThrow(() -> new RuntimeException("Room not found"));

        // Check for overlaps using the repository method
        List<Booking> conflicts = bookingRepository.findBookingsInDateRange(room.getId(), booking.getCheckInDate(),
                booking.getCheckOutDate());
        if (!conflicts.isEmpty()) {
            throw new RuntimeException("Room is already booked for the selected dates");
        }

        // Update Guest Email if provided
        if (booking.getGuest() != null && booking.getGuest().getId() != null) {
            Guest guest = guestRepository.findById(booking.getGuest().getId())
                    .orElseThrow(() -> new RuntimeException("Guest not found"));

            if (booking.getGuest().getEmail() != null && !booking.getGuest().getEmail().isEmpty()) {
                guest.setEmail(booking.getGuest().getEmail());
                guestRepository.save(guest);
            }
            booking.setGuest(guest);
        }

        // Calculate total amount with dynamic pricing
        java.math.BigDecimal totalAmount = calculateDynamicPrice(room, booking.getCheckInDate(),
                booking.getCheckOutDate());
        booking.setTotalAmount(totalAmount);

        // Update room status ONLY if check-in is today
        if (booking.getCheckInDate().equals(java.time.LocalDate.now())) {
            room.setStatus(Room.RoomStatus.BOOKED);
            roomRepository.save(room);
        }

        booking.setStatus(Booking.BookingStatus.CONFIRMED);
        Booking savedBooking = bookingRepository.save(booking);

        // Send email confirmation
        if (savedBooking.getGuest() != null && savedBooking.getGuest().getEmail() != null) {
            emailService.sendBookingConfirmation(savedBooking.getGuest().getEmail(), savedBooking.getGuest().getName(),
                    savedBooking);
        }

        return savedBooking;
    }

    /**
     * Calculates the total price based on dynamic seasonal rates.
     * Logic:
     * - Base price per night
     * - +20% surcharge for Weekends (Friday, Saturday)
     * 
     * @param room     Room entity
     * @param checkIn  Check-in date
     * @param checkOut Check-out date
     * @return Total calculated price
     */
    public java.math.BigDecimal calculateDynamicPrice(Room room, java.time.LocalDate checkIn,
            java.time.LocalDate checkOut) {
        java.math.BigDecimal total = java.math.BigDecimal.ZERO;
        java.math.BigDecimal basePrice = room.getPrice();

        java.time.LocalDate current = checkIn;
        while (current.isBefore(checkOut)) {
            java.math.BigDecimal dailyPrice = basePrice;

            // Check for Weekend (Friday = 6, Saturday = 7 in DayOfWeek enum? No,
            // Monday=1... Sunday=7)
            // java.time.DayOfWeek: MONDAY(1) ... SUNDAY(7)
            // Let's assume Weekend is Friday and Saturday nights
            java.time.DayOfWeek dayOfWeek = current.getDayOfWeek();
            if (dayOfWeek == java.time.DayOfWeek.FRIDAY || dayOfWeek == java.time.DayOfWeek.SATURDAY) {
                dailyPrice = dailyPrice.multiply(new java.math.BigDecimal("1.20"));
            }

            total = total.add(dailyPrice);
            current = current.plusDays(1);
        }

        return total;
    }

    public void cancelBooking(Long id) {
        Booking booking = bookingRepository.findById(id).orElseThrow(() -> new RuntimeException("Booking not found"));
        booking.setStatus(Booking.BookingStatus.CANCELLED);

        // Free up the room
        Room room = booking.getRoom();
        room.setStatus(Room.RoomStatus.AVAILABLE);
        roomRepository.save(room);

        bookingRepository.save(booking);
    }

    public Booking updateBooking(Long id, Booking bookingDetails) {
        Booking booking = bookingRepository.findById(id).orElseThrow(() -> new RuntimeException("Booking not found"));
        booking.setCheckInDate(bookingDetails.getCheckInDate());
        booking.setCheckOutDate(bookingDetails.getCheckOutDate());
        booking.setTotalAmount(bookingDetails.getTotalAmount());
        booking.setStatus(bookingDetails.getStatus());
        return bookingRepository.save(booking);
    }

    public void deleteBooking(Long id) {
        Booking booking = bookingRepository.findById(id).orElseThrow(() -> new RuntimeException("Booking not found"));
        bookingRepository.delete(booking);
    }
}
