package com.hms.service;

import com.hms.model.Booking;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendBookingConfirmation(String to, String guestName, Booking booking) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Booking Confirmation - HMS");
        message.setText(createBookingConfirmationTemplate(guestName, booking));

        try {
            mailSender.send(message);
            System.out.println("Email sent successfully to " + to);
        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
        }
    }

    private String createBookingConfirmationTemplate(String guestName, Booking booking) {
        return "Dear " + guestName + ",\n\n" +
                "Thank you for choosing our hotel! Your booking has been confirmed.\n\n" +
                "Booking Details:\n" +
                "Booking ID: " + booking.getId() + "\n" +
                "Room Type: " + booking.getRoom().getType() + "\n" +
                "Check-in Date: " + booking.getCheckInDate() + "\n" +
                "Check-out Date: " + booking.getCheckOutDate() + "\n" +
                "Total Amount: $" + booking.getTotalAmount() + "\n\n" +
                "We look forward to hosting you!\n\n" +
                "Best regards,\n" +
                "Hotel Management System Team";
    }
}
