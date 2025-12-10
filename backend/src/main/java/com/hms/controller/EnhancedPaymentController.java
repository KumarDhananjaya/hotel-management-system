package com.hms.controller;

import com.hms.model.Payment;
import com.hms.service.EnhancedPaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class EnhancedPaymentController {

    @Autowired
    private EnhancedPaymentService paymentService;

    /**
     * Create a simple payment (without tax calculation)
     */
    @PostMapping
    public ResponseEntity<?> createPayment(@RequestBody Payment payment) {
        try {
            Payment createdPayment = paymentService.createPayment(payment);
            return ResponseEntity.ok(createdPayment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Process payment with tax calculation
     */
    @PostMapping("/process")
    public ResponseEntity<?> processPayment(@RequestBody Map<String, Object> request) {
        try {
            Long bookingId = Long.valueOf(request.get("bookingId").toString());
            String promoCode = (String) request.get("promoCode");
            String stateCode = (String) request.get("stateCode");
            String county = (String) request.get("county");
            String city = (String) request.get("city");
            String paymentMethod = (String) request.get("paymentMethod");

            Payment payment = paymentService.processPaymentWithTaxes(
                    bookingId, promoCode, stateCode, county, city, paymentMethod);

            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Validate promo code
     */
    @PostMapping("/validate-promo")
    public ResponseEntity<?> validatePromoCode(@RequestBody Map<String, Object> request) {
        try {
            String code = (String) request.get("code");
            BigDecimal amount = new BigDecimal(request.get("amount").toString());

            Map<String, Object> result = paymentService.validatePromoCode(code, amount);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Process refund
     */
    @PostMapping("/{id}/refund")
    public ResponseEntity<?> processRefund(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {
        try {
            BigDecimal refundAmount = new BigDecimal(request.get("refundAmount").toString());
            String reason = (String) request.get("reason");

            Payment payment = paymentService.processRefund(id, refundAmount, reason);
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get payments by booking
     */
    @GetMapping("/booking/{bookingId}")
    public List<Payment> getPaymentsByBooking(@PathVariable Long bookingId) {
        return paymentService.getPaymentsByBooking(bookingId);
    }

    /**
     * Update payment
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePayment(@PathVariable Long id, @RequestBody Payment payment) {
        try {
            return ResponseEntity.ok(paymentService.updatePayment(id, payment));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Delete payment
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePayment(@PathVariable Long id) {
        try {
            paymentService.deletePayment(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
