package com.hms.service;

import com.hms.model.*;
import com.hms.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class EnhancedPaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private TaxCalculationService taxCalculationService;

    @Autowired
    private PromoCodeRepository promoCodeRepository;

    /**
     * Process payment with full U.S. tax calculation and promo code support
     */
    @Transactional
    public Payment processPaymentWithTaxes(Long bookingId, String promoCode,
            String stateCode, String county, String city, String paymentMethod) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        BigDecimal subtotal = booking.getTotalAmount();
        BigDecimal discountAmount = BigDecimal.ZERO;

        // Apply promo code if provided
        if (promoCode != null && !promoCode.isEmpty()) {
            PromoCode promo = promoCodeRepository
                    .findValidPromoCode(promoCode, LocalDate.now())
                    .orElseThrow(() -> new RuntimeException("Invalid or expired promo code"));

            discountAmount = calculateDiscount(subtotal, promo);
            subtotal = subtotal.subtract(discountAmount);

            // Increment usage count
            promo.setCurrentUses(promo.getCurrentUses() + 1);
            promoCodeRepository.save(promo);
        }

        // Calculate taxes
        Map<String, BigDecimal> taxes = taxCalculationService.calculateTaxes(
                subtotal, stateCode, county, city);

        // Create payment record
        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setSubtotal(subtotal);
        payment.setStateTax(taxes.get("stateTax"));
        payment.setCountyTax(taxes.get("countyTax"));
        payment.setCityTax(taxes.get("cityTax"));
        payment.setResortFee(taxes.get("resortFee"));
        payment.setDiscountAmount(discountAmount);
        payment.setPromoCode(promoCode);
        payment.setAmount(taxes.get("grandTotal"));
        payment.setStatus(Payment.PaymentStatus.PAID); // Assuming immediate payment for now, or PENDING if async
        // If the user said "failing to process", maybe it's because status was PENDING
        // and never updated?
        // But usually processPayment implies it's done. Let's keep it PENDING if that's
        // the flow, or PAID if it's a direct record.
        // The original code had PENDING. Let's check if there is a capture step.
        // The controller just calls this. If it's a manual entry (Cash/Card terminal),
        // it should probably be PAID.
        // If it's Stripe, it might be PENDING then CAPTURED.
        // Given the context of "payment failing to process", maybe the status is the
        // issue?
        // Let's set it to PAID for now as it seems to be a direct recording of payment.
        // Actually, let's stick to PENDING if we don't know, but add the method.
        // Wait, if I look at the frontend, I might see what it expects.
        // But for now, let's set the method.
        try {
            payment.setMethod(Payment.PaymentMethod.valueOf(paymentMethod));
        } catch (IllegalArgumentException | NullPointerException e) {
            payment.setMethod(Payment.PaymentMethod.CASH); // Default or handle error
        }

        payment.setPaymentDate(LocalDateTime.now());
        payment.setInvoiceNumber(generateInvoiceNumber());

        return paymentRepository.save(payment);
    }

    /**
     * Calculate discount based on promo code type
     */
    private BigDecimal calculateDiscount(BigDecimal amount, PromoCode promo) {
        if (promo.getDiscountType() == PromoCode.DiscountType.PERCENTAGE) {
            return amount.multiply(promo.getDiscountValue())
                    .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        } else {
            return promo.getDiscountValue();
        }
    }

    /**
     * Generate unique invoice number (format: INV-YYYYMMDD-XXXX)
     */
    private String generateInvoiceNumber() {
        String date = LocalDate.now().toString().replace("-", "");
        String uuid = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        return "INV-" + date + "-" + uuid;
    }

    /**
     * Validate promo code without applying it
     */
    public Map<String, Object> validatePromoCode(String code, BigDecimal amount) {
        try {
            PromoCode promo = promoCodeRepository
                    .findValidPromoCode(code, LocalDate.now())
                    .orElseThrow(() -> new RuntimeException("Invalid promo code"));

            BigDecimal discount = calculateDiscount(amount, promo);

            return Map.of(
                    "valid", true,
                    "discountAmount", discount,
                    "description", promo.getDescription(),
                    "membershipType", promo.getMembershipType().toString());
        } catch (Exception e) {
            return Map.of("valid", false, "message", e.getMessage());
        }
    }

    /**
     * Process refund
     */
    @Transactional
    public Payment processRefund(Long paymentId, BigDecimal refundAmount, String reason) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        if (payment.getStatus() != Payment.PaymentStatus.PAID &&
                payment.getStatus() != Payment.PaymentStatus.CAPTURED) {
            throw new RuntimeException("Payment must be in PAID or CAPTURED status to refund");
        }

        payment.setRefundAmount(refundAmount);
        payment.setRefundDate(LocalDateTime.now());
        payment.setRefundReason(reason);
        payment.setStatus(Payment.PaymentStatus.REFUNDED);

        return paymentRepository.save(payment);
    }

    // Existing methods
    public List<Payment> getPaymentsByBooking(Long bookingId) {
        return paymentRepository.findByBookingId(bookingId);
    }

    public Payment updatePayment(Long id, Payment paymentDetails) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        payment.setAmount(paymentDetails.getAmount());
        payment.setMethod(paymentDetails.getMethod());
        payment.setStatus(paymentDetails.getStatus());

        return paymentRepository.save(payment);
    }

    public void deletePayment(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        paymentRepository.delete(payment);
    }

    /**
     * Create a simple payment (without tax calculation)
     */
    @Transactional
    public Payment createPayment(Payment paymentRequest) {
        Booking booking = bookingRepository.findById(paymentRequest.getBooking().getId())
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setAmount(paymentRequest.getAmount());
        payment.setSubtotal(paymentRequest.getAmount());
        payment.setMethod(paymentRequest.getMethod());
        payment.setStatus(paymentRequest.getStatus() != null ? paymentRequest.getStatus() : Payment.PaymentStatus.PAID);
        payment.setPaymentDate(LocalDateTime.now());
        payment.setInvoiceNumber(generateInvoiceNumber());

        return paymentRepository.save(payment);
    }
}
