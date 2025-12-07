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

        if (room.getStatus() != Room.RoomStatus.AVAILABLE) {
            throw new RuntimeException("Room is not available");
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

        // Update room status
        room.setStatus(Room.RoomStatus.BOOKED);
        roomRepository.save(room);

        booking.setStatus(Booking.BookingStatus.CONFIRMED);
        Booking savedBooking = bookingRepository.save(booking);

        // Send email confirmation
        if (savedBooking.getGuest() != null && savedBooking.getGuest().getEmail() != null) {
            emailService.sendBookingConfirmation(savedBooking.getGuest().getEmail(), savedBooking.getGuest().getName(),
                    savedBooking);
        }

        return savedBooking;
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
}
