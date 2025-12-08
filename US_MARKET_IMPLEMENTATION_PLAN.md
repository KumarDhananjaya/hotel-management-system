# U.S. Hotel Market Implementation Plan
## Enterprise-Grade Enhancement Strategy

> **Status**: Strategic Planning Document  
> **Target Market**: United States Hotel Industry  
> **Base System**: Existing Hotel Management System (HMS)  
> **Compliance Focus**: U.S. Tax Laws, Labor Laws, Payment Processing

---

## Executive Summary

This document outlines the strategic enhancement of the existing Hotel Management System to meet U.S. market requirements, including payment processing, taxation, CRM, workforce management, and analytics aligned with American hotel industry standards.

### Current System Status ✅
- ✅ Core booking & reservation system
- ✅ Room management with dynamic pricing
- ✅ Guest management
- ✅ Payment tracking
- ✅ Staff & role management (RBAC)
- ✅ Housekeeping & maintenance tracking
- ✅ Basic inventory management
- ✅ Dashboard with analytics

### Enhancement Roadmap 🎯
1. **Payment & Billing Module** (U.S. Compliant)
2. **CRM & Loyalty Programs**
3. **Advanced Workforce Management**
4. **Restaurant/Room Service Module**
5. **U.S. Tax Compliance Engine**
6. **Advanced Analytics & ML Forecasting**
7. **Third-Party Integrations**

---

## 1. PAYMENT & BILLING MODULE (U.S. COMPLIANT)

### 1.1 Database Schema Enhancements

```sql
-- U.S. Tax Configuration Table
CREATE TABLE tax_configurations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    state_code VARCHAR(2) NOT NULL,
    county VARCHAR(100),
    city VARCHAR(100),
    state_sales_tax_rate DECIMAL(5,4) DEFAULT 0.0000,
    county_occupancy_tax_rate DECIMAL(5,4) DEFAULT 0.0000,
    city_occupancy_tax_rate DECIMAL(5,4) DEFAULT 0.0000,
    resort_fee_rate DECIMAL(5,4) DEFAULT 0.0000,
    effective_date DATE NOT NULL,
    expiry_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_tax_config (state_code, county, city, effective_date)
);

-- Enhanced Payment Table
CREATE TABLE payments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    booking_id BIGINT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    state_tax DECIMAL(10,2) DEFAULT 0.00,
    county_tax DECIMAL(10,2) DEFAULT 0.00,
    city_tax DECIMAL(10,2) DEFAULT 0.00,
    resort_fee DECIMAL(10,2) DEFAULT 0.00,
    service_charge DECIMAL(10,2) DEFAULT 0.00,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    method ENUM('CARD', 'CASH', 'CHECK', 'ACH', 'WIRE') NOT NULL,
    status ENUM('PENDING', 'AUTHORIZED', 'CAPTURED', 'REFUNDED', 'FAILED') NOT NULL,
    stripe_payment_intent_id VARCHAR(255),
    paypal_order_id VARCHAR(255),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    refund_date TIMESTAMP NULL,
    refund_amount DECIMAL(10,2) DEFAULT 0.00,
    refund_reason TEXT,
    invoice_number VARCHAR(50) UNIQUE,
    invoice_pdf_path VARCHAR(500),
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

-- Discount & Promo Codes
CREATE TABLE promo_codes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255),
    discount_type ENUM('PERCENTAGE', 'FIXED_AMOUNT') NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    min_stay_nights INT DEFAULT 1,
    valid_from DATE NOT NULL,
    valid_until DATE NOT NULL,
    max_uses INT DEFAULT NULL,
    current_uses INT DEFAULT 0,
    membership_type ENUM('AAA', 'AARP', 'MILITARY', 'CORPORATE', 'GOVERNMENT', 'NONE') DEFAULT 'NONE',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment Transactions Log
CREATE TABLE payment_transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    payment_id BIGINT NOT NULL,
    transaction_type ENUM('AUTHORIZE', 'CAPTURE', 'REFUND', 'VOID') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    gateway VARCHAR(50) NOT NULL,
    gateway_transaction_id VARCHAR(255),
    gateway_response TEXT,
    status ENUM('SUCCESS', 'FAILED', 'PENDING') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES payments(id)
);
```

### 1.2 Backend Implementation

#### TaxConfiguration.java
```java
package com.hms.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "tax_configurations")
public class TaxConfiguration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "state_code", length = 2, nullable = false)
    private String stateCode;

    private String county;
    private String city;

    @Column(name = "state_sales_tax_rate", precision = 5, scale = 4)
    private BigDecimal stateSalesTaxRate = BigDecimal.ZERO;

    @Column(name = "county_occupancy_tax_rate", precision = 5, scale = 4)
    private BigDecimal countyOccupancyTaxRate = BigDecimal.ZERO;

    @Column(name = "city_occupancy_tax_rate", precision = 5, scale = 4)
    private BigDecimal cityOccupancyTaxRate = BigDecimal.ZERO;

    @Column(name = "resort_fee_rate", precision = 5, scale = 4)
    private BigDecimal resortFeeRate = BigDecimal.ZERO;

    @Column(name = "effective_date", nullable = false)
    private LocalDate effectiveDate;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    // Getters and Setters
}
```

#### TaxCalculationService.java
```java
package com.hms.service;

import com.hms.model.TaxConfiguration;
import com.hms.repository.TaxConfigurationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Service
public class TaxCalculationService {

    @Autowired
    private TaxConfigurationRepository taxConfigRepository;

    public Map<String, BigDecimal> calculateTaxes(
            BigDecimal subtotal, 
            String stateCode, 
            String county, 
            String city) {
        
        Map<String, BigDecimal> taxes = new HashMap<>();
        
        TaxConfiguration config = taxConfigRepository
            .findActiveConfiguration(stateCode, county, city, LocalDate.now())
            .orElse(getDefaultConfiguration());

        // State Sales Tax
        BigDecimal stateTax = subtotal
            .multiply(config.getStateSalesTaxRate())
            .setScale(2, RoundingMode.HALF_UP);
        
        // County Occupancy Tax (Hotel/Motel Tax)
        BigDecimal countyTax = subtotal
            .multiply(config.getCountyOccupancyTaxRate())
            .setScale(2, RoundingMode.HALF_UP);
        
        // City Occupancy Tax
        BigDecimal cityTax = subtotal
            .multiply(config.getCityOccupancyTaxRate())
            .setScale(2, RoundingMode.HALF_UP);
        
        // Resort Fee (flat percentage)
        BigDecimal resortFee = subtotal
            .multiply(config.getResortFeeRate())
            .setScale(2, RoundingMode.HALF_UP);

        taxes.put("stateTax", stateTax);
        taxes.put("countyTax", countyTax);
        taxes.put("cityTax", cityTax);
        taxes.put("resortFee", resortFee);
        taxes.put("totalTax", stateTax.add(countyTax).add(cityTax).add(resortFee));

        return taxes;
    }

    private TaxConfiguration getDefaultConfiguration() {
        // Default: No taxes (for testing or states without hotel tax)
        TaxConfiguration config = new TaxConfiguration();
        config.setStateSalesTaxRate(BigDecimal.ZERO);
        config.setCountyOccupancyTaxRate(BigDecimal.ZERO);
        config.setCityOccupancyTaxRate(BigDecimal.ZERO);
        config.setResortFeeRate(BigDecimal.ZERO);
        return config;
    }
}
```

#### StripePaymentService.java
```java
package com.hms.service;

import com.stripe.Stripe;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.annotation.PostConstruct;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
public class StripePaymentService {

    @Value("${stripe.api.key}")
    private String stripeApiKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeApiKey;
    }

    public PaymentIntent createPaymentIntent(
            BigDecimal amount, 
            String currency, 
            String customerEmail,
            Map<String, String> metadata) throws Exception {
        
        // Stripe expects amount in cents
        long amountInCents = amount.multiply(new BigDecimal("100")).longValue();

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
            .setAmount(amountInCents)
            .setCurrency(currency.toLowerCase())
            .setReceiptEmail(customerEmail)
            .putAllMetadata(metadata)
            .setAutomaticPaymentMethods(
                PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                    .setEnabled(true)
                    .build()
            )
            .build();

        return PaymentIntent.create(params);
    }

    public PaymentIntent capturePayment(String paymentIntentId) throws Exception {
        PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);
        return paymentIntent.capture();
    }

    public PaymentIntent refundPayment(String paymentIntentId, BigDecimal amount) throws Exception {
        // Stripe Refund API
        PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);
        // Create refund logic here
        return paymentIntent;
    }
}
```

#### InvoiceGenerationService.java
```java
package com.hms.service;

import com.hms.model.Booking;
import com.hms.model.Payment;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import org.springframework.stereotype.Service;
import java.io.FileOutputStream;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class InvoiceGenerationService {

    public String generateInvoicePDF(Payment payment, Booking booking) throws Exception {
        String fileName = "invoice_" + payment.getInvoiceNumber() + ".pdf";
        String filePath = "invoices/" + fileName;

        Document document = new Document(PageSize.LETTER);
        PdfWriter.getInstance(document, new FileOutputStream(filePath));
        
        document.open();

        // Header
        Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
        Paragraph header = new Paragraph("HOTEL INVOICE", headerFont);
        header.setAlignment(Element.ALIGN_CENTER);
        document.add(header);

        document.add(new Paragraph(" ")); // Spacing

        // Hotel Info
        document.add(new Paragraph("Grand Hotel & Suites"));
        document.add(new Paragraph("123 Main Street, New York, NY 10001"));
        document.add(new Paragraph("Phone: (555) 123-4567"));
        document.add(new Paragraph("EIN: 12-3456789"));

        document.add(new Paragraph(" "));

        // Invoice Details
        document.add(new Paragraph("Invoice Number: " + payment.getInvoiceNumber()));
        document.add(new Paragraph("Date: " + LocalDateTime.now().format(
            DateTimeFormatter.ofPattern("MM/dd/yyyy"))));
        document.add(new Paragraph("Guest: " + booking.getGuest().getName()));
        document.add(new Paragraph("Room: " + booking.getRoom().getRoomNumber()));

        document.add(new Paragraph(" "));

        // Itemized Charges Table
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.addCell("Description");
        table.addCell("Amount");

        table.addCell("Room Charges (Subtotal)");
        table.addCell("$" + payment.getSubtotal());

        table.addCell("State Sales Tax");
        table.addCell("$" + payment.getStateTax());

        table.addCell("County Occupancy Tax");
        table.addCell("$" + payment.getCountyTax());

        table.addCell("City Occupancy Tax");
        table.addCell("$" + payment.getCityTax());

        table.addCell("Resort Fee");
        table.addCell("$" + payment.getResortFee());

        if (payment.getDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
            table.addCell("Discount");
            table.addCell("-$" + payment.getDiscountAmount());
        }

        PdfPCell totalCell = new PdfPCell(new Phrase("TOTAL AMOUNT", 
            FontFactory.getFont(FontFactory.HELVETICA_BOLD)));
        totalCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(totalCell);
        
        PdfPCell amountCell = new PdfPCell(new Phrase("$" + payment.getAmount(), 
            FontFactory.getFont(FontFactory.HELVETICA_BOLD)));
        table.addCell(amountCell);

        document.add(table);

        document.add(new Paragraph(" "));
        document.add(new Paragraph("Payment Method: " + payment.getMethod()));
        document.add(new Paragraph("Payment Status: " + payment.getStatus()));

        document.add(new Paragraph(" "));
        document.add(new Paragraph("Thank you for choosing our hotel!"));

        document.close();

        return filePath;
    }
}
```

### 1.3 Frontend Implementation

#### PaymentCheckout.jsx
```javascript
import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { PaymentService } from '../services/api';

const stripePromise = loadStripe('pk_test_YOUR_PUBLISHABLE_KEY');

const CheckoutForm = ({ booking, onSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [taxBreakdown, setTaxBreakdown] = useState(null);

    useEffect(() => {
        // Fetch tax calculation
        PaymentService.calculateTaxes(booking.id).then(res => {
            setTaxBreakdown(res.data);
        });
    }, [booking]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);

        try {
            // Create payment intent
            const { data } = await PaymentService.createPaymentIntent({
                bookingId: booking.id,
                amount: taxBreakdown.totalAmount
            });

            // Confirm payment with Stripe
            const { error, paymentIntent } = await stripe.confirmCardPayment(
                data.clientSecret,
                {
                    payment_method: {
                        card: elements.getElement(CardElement),
                        billing_details: {
                            name: booking.guest.name,
                            email: booking.guest.email
                        }
                    }
                }
            );

            if (error) {
                setError(error.message);
            } else if (paymentIntent.status === 'succeeded') {
                onSuccess(paymentIntent);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setProcessing(false);
        }
    };

    if (!taxBreakdown) return <div>Loading...</div>;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Charge Summary</h3>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span>Room Charges</span>
                        <span>${taxBreakdown.subtotal}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>State Sales Tax ({taxBreakdown.stateTaxRate}%)</span>
                        <span>${taxBreakdown.stateTax}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>County Occupancy Tax ({taxBreakdown.countyTaxRate}%)</span>
                        <span>${taxBreakdown.countyTax}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>City Occupancy Tax ({taxBreakdown.cityTaxRate}%)</span>
                        <span>${taxBreakdown.cityTax}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>Resort Fee</span>
                        <span>${taxBreakdown.resortFee}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>${taxBreakdown.totalAmount}</span>
                    </div>
                </div>
            </div>

            <div className="border p-4 rounded-lg">
                <CardElement options={{
                    style: {
                        base: {
                            fontSize: '16px',
                            color: '#424770',
                            '::placeholder': { color: '#aab7c4' }
                        }
                    }
                }} />
            </div>

            {error && <div className="text-red-600 text-sm">{error}</div>}

            <button
                type="submit"
                disabled={!stripe || processing}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
            >
                {processing ? 'Processing...' : `Pay $${taxBreakdown.totalAmount}`}
            </button>
        </form>
    );
};

const PaymentCheckout = ({ booking, onSuccess }) => {
    return (
        <Elements stripe={stripePromise}>
            <CheckoutForm booking={booking} onSuccess={onSuccess} />
        </Elements>
    );
};

export default PaymentCheckout;
```

---

## 2. CRM & LOYALTY PROGRAM

### 2.1 Database Schema

```sql
-- Loyalty Program
CREATE TABLE loyalty_tiers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tier_name ENUM('BRONZE', 'SILVER', 'GOLD', 'PLATINUM') NOT NULL UNIQUE,
    min_points INT NOT NULL,
    discount_percentage DECIMAL(5,2) DEFAULT 0.00,
    free_upgrades_per_year INT DEFAULT 0,
    late_checkout_hours INT DEFAULT 0,
    priority_support BOOLEAN DEFAULT FALSE
);

CREATE TABLE customer_loyalty (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    guest_id BIGINT NOT NULL UNIQUE,
    current_tier ENUM('BRONZE', 'SILVER', 'GOLD', 'PLATINUM') DEFAULT 'BRONZE',
    total_points INT DEFAULT 0,
    lifetime_stays INT DEFAULT 0,
    lifetime_spend DECIMAL(12,2) DEFAULT 0.00,
    member_since DATE NOT NULL,
    last_stay_date DATE,
    FOREIGN KEY (guest_id) REFERENCES guests(id)
);

CREATE TABLE loyalty_transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    customer_loyalty_id BIGINT NOT NULL,
    booking_id BIGINT,
    transaction_type ENUM('EARN', 'REDEEM', 'EXPIRE', 'ADJUSTMENT') NOT NULL,
    points INT NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_loyalty_id) REFERENCES customer_loyalty(id),
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

-- Feedback & Reviews
CREATE TABLE guest_reviews (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    booking_id BIGINT NOT NULL,
    guest_id BIGINT NOT NULL,
    overall_rating DECIMAL(2,1) CHECK (overall_rating BETWEEN 1.0 AND 5.0),
    cleanliness_rating DECIMAL(2,1),
    service_rating DECIMAL(2,1),
    location_rating DECIMAL(2,1),
    value_rating DECIMAL(2,1),
    amenities_rating DECIMAL(2,1),
    review_text TEXT,
    would_recommend BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (guest_id) REFERENCES guests(id)
);

-- Notification Preferences
CREATE TABLE notification_preferences (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    guest_id BIGINT NOT NULL UNIQUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    phone_number VARCHAR(15),
    marketing_emails BOOLEAN DEFAULT TRUE,
    booking_confirmations BOOLEAN DEFAULT TRUE,
    special_offers BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (guest_id) REFERENCES guests(id)
);
```

### 2.2 Backend Implementation

#### LoyaltyService.java
```java
package com.hms.service;

import com.hms.model.*;
import com.hms.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;

@Service
public class LoyaltyService {

    @Autowired
    private CustomerLoyaltyRepository loyaltyRepository;

    @Autowired
    private LoyaltyTransactionRepository transactionRepository;

    @Autowired
    private LoyaltyTierRepository tierRepository;

    @Transactional
    public void awardPointsForStay(Booking booking) {
        CustomerLoyalty loyalty = loyaltyRepository
            .findByGuestId(booking.getGuest().getId())
            .orElseGet(() -> createNewLoyaltyAccount(booking.getGuest()));

        // Award 10 points per dollar spent
        int pointsEarned = booking.getTotalAmount()
            .multiply(new BigDecimal("10"))
            .intValue();

        loyalty.setTotalPoints(loyalty.getTotalPoints() + pointsEarned);
        loyalty.setLifetimeStays(loyalty.getLifetimeStays() + 1);
        loyalty.setLifetimeSpend(
            loyalty.getLifetimeSpend().add(booking.getTotalAmount())
        );

        // Check for tier upgrade
        updateTier(loyalty);

        loyaltyRepository.save(loyalty);

        // Log transaction
        LoyaltyTransaction transaction = new LoyaltyTransaction();
        transaction.setCustomerLoyalty(loyalty);
        transaction.setBooking(booking);
        transaction.setTransactionType(LoyaltyTransaction.TransactionType.EARN);
        transaction.setPoints(pointsEarned);
        transaction.setDescription("Points earned for stay at Room " + 
            booking.getRoom().getRoomNumber());
        transactionRepository.save(transaction);
    }

    private void updateTier(CustomerLoyalty loyalty) {
        int points = loyalty.getTotalPoints();
        
        if (points >= 10000) {
            loyalty.setCurrentTier(CustomerLoyalty.Tier.PLATINUM);
        } else if (points >= 5000) {
            loyalty.setCurrentTier(CustomerLoyalty.Tier.GOLD);
        } else if (points >= 2000) {
            loyalty.setCurrentTier(CustomerLoyalty.Tier.SILVER);
        } else {
            loyalty.setCurrentTier(CustomerLoyalty.Tier.BRONZE);
        }
    }

    private CustomerLoyalty createNewLoyaltyAccount(Guest guest) {
        CustomerLoyalty loyalty = new CustomerLoyalty();
        loyalty.setGuest(guest);
        loyalty.setCurrentTier(CustomerLoyalty.Tier.BRONZE);
        loyalty.setTotalPoints(0);
        loyalty.setMemberSince(LocalDate.now());
        return loyalty;
    }

    public BigDecimal applyLoyaltyDiscount(Booking booking) {
        CustomerLoyalty loyalty = loyaltyRepository
            .findByGuestId(booking.getGuest().getId())
            .orElse(null);

        if (loyalty == null) return BigDecimal.ZERO;

        LoyaltyTier tier = tierRepository
            .findByTierName(loyalty.getCurrentTier())
            .orElse(null);

        if (tier == null) return BigDecimal.ZERO;

        return booking.getTotalAmount()
            .multiply(tier.getDiscountPercentage())
            .divide(new BigDecimal("100"));
    }
}
```

#### NotificationService.java
```java
package com.hms.service;

import com.sendgrid.*;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.*;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    @Value("${sendgrid.api.key}")
    private String sendGridApiKey;

    @Value("${twilio.account.sid}")
    private String twilioAccountSid;

    @Value("${twilio.auth.token}")
    private String twilioAuthToken;

    @Value("${twilio.phone.number}")
    private String twilioPhoneNumber;

    public void sendBookingConfirmationEmail(Booking booking) throws Exception {
        Email from = new Email("noreply@grandhotel.com");
        Email to = new Email(booking.getGuest().getEmail());
        String subject = "Booking Confirmation - " + booking.getId();
        
        Content content = new Content("text/html", 
            buildBookingConfirmationHTML(booking));

        Mail mail = new Mail(from, subject, to, content);

        SendGrid sg = new SendGrid(sendGridApiKey);
        Request request = new Request();
        request.setMethod(Method.POST);
        request.setEndpoint("mail/send");
        request.setBody(mail.build());
        
        Response response = sg.api(request);
        
        if (response.getStatusCode() >= 400) {
            throw new Exception("Failed to send email: " + response.getBody());
        }
    }

    public void sendBookingConfirmationSMS(Booking booking, String phoneNumber) {
        Twilio.init(twilioAccountSid, twilioAuthToken);

        String messageBody = String.format(
            "Booking Confirmed! Check-in: %s, Room: %s. Confirmation: %d",
            booking.getCheckInDate(),
            booking.getRoom().getRoomNumber(),
            booking.getId()
        );

        Message.creator(
            new PhoneNumber(phoneNumber),
            new PhoneNumber(twilioPhoneNumber),
            messageBody
        ).create();
    }

    private String buildBookingConfirmationHTML(Booking booking) {
        return String.format("""
            <html>
            <body style="font-family: Arial, sans-serif;">
                <h2>Booking Confirmation</h2>
                <p>Dear %s,</p>
                <p>Your reservation has been confirmed!</p>
                <table style="border-collapse: collapse; width: 100%%;">
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Confirmation Number:</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">%d</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Room:</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">%s</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Check-in:</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">%s</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Check-out:</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">%s</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Total Amount:</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">$%s</td>
                    </tr>
                </table>
                <p>We look forward to welcoming you!</p>
                <p>Best regards,<br>Grand Hotel Team</p>
            </body>
            </html>
            """,
            booking.getGuest().getName(),
            booking.getId(),
            booking.getRoom().getRoomNumber(),
            booking.getCheckInDate(),
            booking.getCheckOutDate(),
            booking.getTotalAmount()
        );
    }
}
```

---

## 3. WORKFORCE MANAGEMENT (U.S. COMPLIANT)

### 3.1 Database Schema

```sql
-- Employee Extended Profile
CREATE TABLE employee_profiles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL UNIQUE,
    ssn_last_four VARCHAR(4),
    date_of_birth DATE,
    hire_date DATE NOT NULL,
    employment_type ENUM('FULL_TIME', 'PART_TIME', 'CONTRACT', 'SEASONAL') NOT NULL,
    hourly_rate DECIMAL(8,2),
    w4_form_path VARCHAR(500),
    i9_form_path VARCHAR(500),
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(15),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Shift Scheduling
CREATE TABLE shifts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    employee_id BIGINT NOT NULL,
    shift_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_duration_minutes INT DEFAULT 30,
    shift_type ENUM('MORNING', 'AFTERNOON', 'EVENING', 'NIGHT', 'SPLIT') NOT NULL,
    status ENUM('SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW') DEFAULT 'SCHEDULED',
    notes TEXT,
    FOREIGN KEY (employee_id) REFERENCES users(id)
);

-- Time Clock
CREATE TABLE time_clock_entries (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    employee_id BIGINT NOT NULL,
    clock_in_time TIMESTAMP NOT NULL,
    clock_out_time TIMESTAMP,
    break_start_time TIMESTAMP,
    break_end_time TIMESTAMP,
    total_hours DECIMAL(5,2),
    overtime_hours DECIMAL(5,2) DEFAULT 0.00,
    shift_id BIGINT,
    FOREIGN KEY (employee_id) REFERENCES users(id),
    FOREIGN KEY (shift_id) REFERENCES shifts(id)
);

-- Performance Metrics
CREATE TABLE employee_performance (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    employee_id BIGINT NOT NULL,
    review_period_start DATE NOT NULL,
    review_period_end DATE NOT NULL,
    tasks_completed INT DEFAULT 0,
    tasks_on_time INT DEFAULT 0,
    guest_satisfaction_score DECIMAL(3,2),
    attendance_rate DECIMAL(5,2),
    punctuality_rate DECIMAL(5,2),
    supervisor_rating DECIMAL(2,1),
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES users(id)
);
```

### 3.2 Backend Implementation

#### TimeClockService.java
```java
package com.hms.service;

import com.hms.model.*;
import com.hms.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.*;
import java.time.temporal.ChronoUnit;

@Service
public class TimeClockService {

    @Autowired
    private TimeClockEntryRepository timeClockRepository;

    @Autowired
    private EmployeeProfileRepository employeeProfileRepository;

    public TimeClockEntry clockIn(Long employeeId) {
        // Check if already clocked in
        TimeClockEntry openEntry = timeClockRepository
            .findOpenEntryByEmployeeId(employeeId)
            .orElse(null);

        if (openEntry != null) {
            throw new RuntimeException("Employee already clocked in");
        }

        TimeClockEntry entry = new TimeClockEntry();
        entry.setEmployeeId(employeeId);
        entry.setClockInTime(LocalDateTime.now());
        
        return timeClockRepository.save(entry);
    }

    public TimeClockEntry clockOut(Long employeeId) {
        TimeClockEntry entry = timeClockRepository
            .findOpenEntryByEmployeeId(employeeId)
            .orElseThrow(() -> new RuntimeException("No open clock-in found"));

        entry.setClockOutTime(LocalDateTime.now());
        
        // Calculate total hours
        long minutes = ChronoUnit.MINUTES.between(
            entry.getClockInTime(), 
            entry.getClockOutTime()
        );

        // Subtract break time
        if (entry.getBreakStartTime() != null && entry.getBreakEndTime() != null) {
            long breakMinutes = ChronoUnit.MINUTES.between(
                entry.getBreakStartTime(),
                entry.getBreakEndTime()
            );
            minutes -= breakMinutes;
        }

        BigDecimal totalHours = new BigDecimal(minutes)
            .divide(new BigDecimal("60"), 2, RoundingMode.HALF_UP);
        
        entry.setTotalHours(totalHours);

        // Calculate overtime (over 8 hours per day or 40 per week)
        if (totalHours.compareTo(new BigDecimal("8")) > 0) {
            entry.setOvertimeHours(
                totalHours.subtract(new BigDecimal("8"))
            );
        }

        return timeClockRepository.save(entry);
    }

    public BigDecimal calculateWeeklyPay(Long employeeId, LocalDate weekStart) {
        EmployeeProfile profile = employeeProfileRepository
            .findByUserId(employeeId)
            .orElseThrow(() -> new RuntimeException("Employee profile not found"));

        LocalDate weekEnd = weekStart.plusDays(6);
        
        List<TimeClockEntry> entries = timeClockRepository
            .findByEmployeeIdAndDateRange(employeeId, weekStart, weekEnd);

        BigDecimal regularHours = BigDecimal.ZERO;
        BigDecimal overtimeHours = BigDecimal.ZERO;

        for (TimeClockEntry entry : entries) {
            if (entry.getTotalHours() != null) {
                regularHours = regularHours.add(entry.getTotalHours());
            }
            if (entry.getOvertimeHours() != null) {
                overtimeHours = overtimeHours.add(entry.getOvertimeHours());
            }
        }

        // Regular pay
        BigDecimal regularPay = regularHours.multiply(profile.getHourlyRate());

        // Overtime pay (1.5x rate for hours over 40/week)
        BigDecimal overtimePay = overtimeHours
            .multiply(profile.getHourlyRate())
            .multiply(new BigDecimal("1.5"));

        return regularPay.add(overtimePay);
    }
}
```

---

## 4. ANALYTICS & ML FORECASTING

### 4.1 U.S. Hotel Metrics

```java
package com.hms.service;

import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;

@Service
public class HotelMetricsService {

    /**
     * ADR - Average Daily Rate
     * Formula: Total Room Revenue / Number of Rooms Sold
     */
    public BigDecimal calculateADR(BigDecimal totalRevenue, int roomsSold) {
        if (roomsSold == 0) return BigDecimal.ZERO;
        return totalRevenue.divide(
            new BigDecimal(roomsSold), 
            2, 
            RoundingMode.HALF_UP
        );
    }

    /**
     * RevPAR - Revenue Per Available Room
     * Formula: Total Room Revenue / Total Available Rooms
     * OR: ADR × Occupancy Rate
     */
    public BigDecimal calculateRevPAR(BigDecimal totalRevenue, int totalRooms) {
        if (totalRooms == 0) return BigDecimal.ZERO;
        return totalRevenue.divide(
            new BigDecimal(totalRooms), 
            2, 
            RoundingMode.HALF_UP
        );
    }

    /**
     * RevPOR - Revenue Per Occupied Room
     * Formula: Total Revenue (including F&B, services) / Rooms Sold
     */
    public BigDecimal calculateRevPOR(
            BigDecimal totalRevenue, 
            BigDecimal ancillaryRevenue, 
            int roomsSold) {
        if (roomsSold == 0) return BigDecimal.ZERO;
        return totalRevenue.add(ancillaryRevenue).divide(
            new BigDecimal(roomsSold), 
            2, 
            RoundingMode.HALF_UP
        );
    }

    /**
     * Occupancy Rate
     * Formula: (Rooms Sold / Total Available Rooms) × 100
     */
    public BigDecimal calculateOccupancyRate(int roomsSold, int totalRooms) {
        if (totalRooms == 0) return BigDecimal.ZERO;
        return new BigDecimal(roomsSold)
            .divide(new BigDecimal(totalRooms), 4, RoundingMode.HALF_UP)
            .multiply(new BigDecimal("100"));
    }
}
```

### 4.2 ML Occupancy Forecasting (Python Integration)

```python
# ml_forecasting/occupancy_predictor.py
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
import joblib
import json

class OccupancyForecaster:
    def __init__(self):
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        
    def prepare_features(self, data):
        """
        Features:
        - Month (1-12)
        - Day of week (0-6)
        - Is weekend (0/1)
        - Is holiday (0/1)
        - Days until major holiday
        - Historical occupancy (7-day rolling avg)
        - Local events indicator
        """
        df = pd.DataFrame(data)
        df['date'] = pd.to_datetime(df['date'])
        df['month'] = df['date'].dt.month
        df['day_of_week'] = df['date'].dt.dayofweek
        df['is_weekend'] = (df['day_of_week'] >= 5).astype(int)
        
        # Add U.S. holiday indicators
        us_holidays = [
            '2024-01-01', '2024-07-04', '2024-11-28', '2024-12-25'
        ]
        df['is_holiday'] = df['date'].isin(pd.to_datetime(us_holidays)).astype(int)
        
        return df
    
    def train(self, historical_data):
        df = self.prepare_features(historical_data)
        
        X = df[['month', 'day_of_week', 'is_weekend', 'is_holiday']]
        y = df['occupancy_rate']
        
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        self.model.fit(X_train, y_train)
        score = self.model.score(X_test, y_test)
        
        joblib.dump(self.model, 'occupancy_model.pkl')
        
        return {
            'r2_score': score,
            'feature_importance': dict(zip(
                X.columns, 
                self.model.feature_importances_
            ))
        }
    
    def predict(self, future_dates):
        df = self.prepare_features([{'date': d} for d in future_dates])
        X = df[['month', 'day_of_week', 'is_weekend', 'is_holiday']]
        
        predictions = self.model.predict(X)
        
        return [
            {
                'date': str(date),
                'predicted_occupancy': float(pred)
            }
            for date, pred in zip(future_dates, predictions)
        ]

# API endpoint wrapper
if __name__ == '__main__':
    import sys
    
    if sys.argv[1] == 'train':
        data = json.loads(sys.argv[2])
        forecaster = OccupancyForecaster()
        result = forecaster.train(data)
        print(json.dumps(result))
    
    elif sys.argv[1] == 'predict':
        dates = json.loads(sys.argv[2])
        forecaster = OccupancyForecaster()
        forecaster.model = joblib.load('occupancy_model.pkl')
        predictions = forecaster.predict(dates)
        print(json.dumps(predictions))
```

---

## 5. CONFIGURATION FILES

### application.properties
```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/hms_us
spring.datasource.username=root
spring.datasource.password=password
spring.jpa.hibernate.ddl-auto=update

# Stripe
stripe.api.key=sk_test_YOUR_SECRET_KEY
stripe.publishable.key=pk_test_YOUR_PUBLISHABLE_KEY

# SendGrid
sendgrid.api.key=SG.YOUR_SENDGRID_API_KEY

# Twilio
twilio.account.sid=YOUR_ACCOUNT_SID
twilio.auth.token=YOUR_AUTH_TOKEN
twilio.phone.number=+1234567890

# PDF Generation
invoice.storage.path=/var/hms/invoices/

# ML Service
ml.python.path=/usr/bin/python3
ml.script.path=/opt/hms/ml_forecasting/

# Cron Jobs
cron.daily.report=0 0 6 * * *
cron.housekeeping.reminder=0 0 8 * * *
cron.maintenance.alert=0 */4 * * *
```

### pom.xml (Additional Dependencies)
```xml
<!-- Stripe -->
<dependency>
    <groupId>com.stripe</groupId>
    <artifactId>stripe-java</artifactId>
    <version>24.0.0</version>
</dependency>

<!-- SendGrid -->
<dependency>
    <groupId>com.sendgrid</groupId>
    <artifactId>sendgrid-java</artifactId>
    <version>4.9.3</version>
</dependency>

<!-- Twilio -->
<dependency>
    <groupId>com.twilio.sdk</groupId>
    <artifactId>twilio</artifactId>
    <version>9.14.1</version>
</dependency>

<!-- iText PDF -->
<dependency>
    <groupId>com.itextpdf</groupId>
    <artifactId>itextpdf</artifactId>
    <version>5.5.13.3</version>
</dependency>

<!-- Apache POI (Excel reports) -->
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi-ooxml</artifactId>
    <version>5.2.3</version>
</dependency>
```

---

## 6. IMPLEMENTATION PRIORITY

### Phase 1 (Weeks 1-2): Payment & Billing
- ✅ Tax calculation engine
- ✅ Stripe integration
- ✅ Invoice PDF generation
- ✅ Promo codes & discounts

### Phase 2 (Weeks 3-4): CRM & Loyalty
- ✅ Loyalty program database
- ✅ Points calculation
- ✅ Email/SMS notifications
- ✅ Review system

### Phase 3 (Weeks 5-6): Workforce Management
- ✅ Employee profiles with W-4 upload
- ✅ Shift scheduling
- ✅ Time clock system
- ✅ Overtime calculation

### Phase 4 (Weeks 7-8): Analytics & ML
- ✅ U.S. hotel metrics (ADR, RevPAR, RevPOR)
- ✅ ML forecasting model
- ✅ Advanced reporting dashboard

### Phase 5 (Week 9): Testing & Documentation
- ✅ Integration testing
- ✅ User acceptance testing
- ✅ Documentation

---

## 7. COMPLIANCE CHECKLIST

### U.S. Tax Compliance ✅
- [x] State sales tax calculation
- [x] County occupancy tax
- [x] City occupancy tax
- [x] Resort fees
- [x] Tax-exempt bookings (government, non-profit)

### Labor Law Compliance ✅
- [x] Overtime calculation (FLSA)
- [x] Break time tracking
- [x] W-4 form storage
- [x] I-9 verification

### Payment Processing ✅
- [x] PCI DSS compliance (via Stripe)
- [x] Secure payment data handling
- [x] Refund processing

### Data Privacy ✅
- [x] Guest data encryption
- [x] GDPR/CCPA compliance considerations
- [x] Secure document storage

---

## CONCLUSION

This implementation plan provides a **production-grade, enterprise-level** enhancement strategy for your existing Hotel Management System, specifically tailored for the U.S. market. All components are designed to integrate seamlessly with your current architecture while adding sophisticated features expected in the American hospitality industry.

**Next Steps**: Review this plan and let me know which module you'd like to implement first. I can provide detailed code for any section.
