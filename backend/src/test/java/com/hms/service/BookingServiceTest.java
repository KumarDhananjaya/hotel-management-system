package com.hms.service;

import com.hms.model.Booking;
import com.hms.model.Guest;
import com.hms.model.Room;
import com.hms.repository.BookingRepository;
import com.hms.repository.GuestRepository;
import com.hms.repository.RoomRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private GuestRepository guestRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private BookingService bookingService;

    private Room room;
    private Guest guest;

    @BeforeEach
    void setUp() {
        room = new Room(1L, "101", Room.RoomType.SINGLE, new BigDecimal("100.00"), Room.RoomStatus.AVAILABLE,
                "Single Room");
        guest = new Guest();
        guest.setId(1L);
        guest.setName("John Doe");
        guest.setEmail("john@example.com");
    }

    @Test
    void testCalculateDynamicPrice_Weekdays() {
        // Mon to Wed (2 nights)
        LocalDate checkIn = LocalDate.of(2023, 10, 2); // Monday
        LocalDate checkOut = LocalDate.of(2023, 10, 4); // Wednesday

        BigDecimal price = bookingService.calculateDynamicPrice(room, checkIn, checkOut);

        // 100 * 2 = 200
        assertEquals(new BigDecimal("200.00"), price);
    }

    @Test
    void testCalculateDynamicPrice_Weekend() {
        // Fri to Sun (2 nights: Fri night, Sat night)
        LocalDate checkIn = LocalDate.of(2023, 10, 6); // Friday
        LocalDate checkOut = LocalDate.of(2023, 10, 8); // Sunday

        BigDecimal price = bookingService.calculateDynamicPrice(room, checkIn, checkOut);

        // Fri: 100 * 1.2 = 120
        // Sat: 100 * 1.2 = 120
        // Total: 240
        assertTrue(price.compareTo(new BigDecimal("240.00")) == 0, "Price should be 240.00");
    }

    @Test
    void testCreateBooking_Success() {
        Booking booking = new Booking();
        booking.setRoom(room);
        booking.setGuest(guest);
        booking.setCheckInDate(LocalDate.now().plusDays(1));
        booking.setCheckOutDate(LocalDate.now().plusDays(2));

        when(roomRepository.findById(1L)).thenReturn(Optional.of(room));
        when(bookingRepository.findBookingsInDateRange(any(), any(), any())).thenReturn(Collections.emptyList());
        when(guestRepository.findById(1L)).thenReturn(Optional.of(guest));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Booking created = bookingService.createBooking(booking);

        assertNotNull(created);
        assertEquals(Booking.BookingStatus.CONFIRMED, created.getStatus());
        verify(emailService, times(1)).sendBookingConfirmation(anyString(), anyString(), any());
    }

    @Test
    void testCreateBooking_Conflict() {
        Booking booking = new Booking();
        booking.setRoom(room);
        booking.setCheckInDate(LocalDate.now());
        booking.setCheckOutDate(LocalDate.now().plusDays(1));

        when(roomRepository.findById(1L)).thenReturn(Optional.of(room));
        when(bookingRepository.findBookingsInDateRange(any(), any(), any()))
                .thenReturn(Collections.singletonList(new Booking()));

        assertThrows(RuntimeException.class, () -> bookingService.createBooking(booking));
    }
}
