package com.hms.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "payments")
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    private BigDecimal amount;

    // Tax Breakdown (U.S. Compliant)
    @Column(precision = 10, scale = 2)
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(name = "state_tax", precision = 10, scale = 2)
    private BigDecimal stateTax = BigDecimal.ZERO;

    @Column(name = "county_tax", precision = 10, scale = 2)
    private BigDecimal countyTax = BigDecimal.ZERO;

    @Column(name = "city_tax", precision = 10, scale = 2)
    private BigDecimal cityTax = BigDecimal.ZERO;

    @Column(name = "resort_fee", precision = 10, scale = 2)
    private BigDecimal resortFee = BigDecimal.ZERO;

    @Column(name = "service_charge", precision = 10, scale = 2)
    private BigDecimal serviceCharge = BigDecimal.ZERO;

    @Column(name = "discount_amount", precision = 10, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "promo_code")
    private String promoCode;

    // Invoice & Payment Tracking
    @Column(name = "invoice_number", unique = true)
    private String invoiceNumber;

    @Column(name = "invoice_pdf_path")
    private String invoicePdfPath;

    @Column(name = "stripe_payment_intent_id")
    private String stripePaymentIntentId;

    private LocalDateTime paymentDate;

    // Refund Support
    @Column(name = "refund_date")
    private LocalDateTime refundDate;

    @Column(name = "refund_amount", precision = 10, scale = 2)
    private BigDecimal refundAmount = BigDecimal.ZERO;

    @Column(name = "refund_reason")
    private String refundReason;

    @Enumerated(EnumType.STRING)
    private PaymentMethod method;

    @Enumerated(EnumType.STRING)
    private PaymentStatus status;

    @PrePersist
    protected void onCreate() {
        paymentDate = LocalDateTime.now();
    }

    public enum PaymentMethod {
        CARD, CASH, UPI, CHECK, ACH, WIRE
    }

    public enum PaymentStatus {
        PENDING, AUTHORIZED, CAPTURED, PAID, REFUNDED, FAILED
    }

    public Payment() {
    }

    public Payment(Long id, Booking booking, BigDecimal amount, LocalDateTime paymentDate, PaymentMethod method,
            PaymentStatus status) {
        this.id = id;
        this.booking = booking;
        this.amount = amount;
        this.paymentDate = paymentDate;
        this.method = method;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Booking getBooking() {
        return booking;
    }

    public void setBooking(Booking booking) {
        this.booking = booking;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public LocalDateTime getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(LocalDateTime paymentDate) {
        this.paymentDate = paymentDate;
    }

    public PaymentMethod getMethod() {
        return method;
    }

    public void setMethod(PaymentMethod method) {
        this.method = method;
    }

    public PaymentStatus getStatus() {
        return status;
    }

    public void setStatus(PaymentStatus status) {
        this.status = status;
    }

    // Tax Breakdown Getters and Setters
    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public BigDecimal getStateTax() {
        return stateTax;
    }

    public void setStateTax(BigDecimal stateTax) {
        this.stateTax = stateTax;
    }

    public BigDecimal getCountyTax() {
        return countyTax;
    }

    public void setCountyTax(BigDecimal countyTax) {
        this.countyTax = countyTax;
    }

    public BigDecimal getCityTax() {
        return cityTax;
    }

    public void setCityTax(BigDecimal cityTax) {
        this.cityTax = cityTax;
    }

    public BigDecimal getResortFee() {
        return resortFee;
    }

    public void setResortFee(BigDecimal resortFee) {
        this.resortFee = resortFee;
    }

    public BigDecimal getServiceCharge() {
        return serviceCharge;
    }

    public void setServiceCharge(BigDecimal serviceCharge) {
        this.serviceCharge = serviceCharge;
    }

    public BigDecimal getDiscountAmount() {
        return discountAmount;
    }

    public void setDiscountAmount(BigDecimal discountAmount) {
        this.discountAmount = discountAmount;
    }

    public String getPromoCode() {
        return promoCode;
    }

    public void setPromoCode(String promoCode) {
        this.promoCode = promoCode;
    }

    // Invoice Getters and Setters
    public String getInvoiceNumber() {
        return invoiceNumber;
    }

    public void setInvoiceNumber(String invoiceNumber) {
        this.invoiceNumber = invoiceNumber;
    }

    public String getInvoicePdfPath() {
        return invoicePdfPath;
    }

    public void setInvoicePdfPath(String invoicePdfPath) {
        this.invoicePdfPath = invoicePdfPath;
    }

    public String getStripePaymentIntentId() {
        return stripePaymentIntentId;
    }

    public void setStripePaymentIntentId(String stripePaymentIntentId) {
        this.stripePaymentIntentId = stripePaymentIntentId;
    }

    // Refund Getters and Setters
    public LocalDateTime getRefundDate() {
        return refundDate;
    }

    public void setRefundDate(LocalDateTime refundDate) {
        this.refundDate = refundDate;
    }

    public BigDecimal getRefundAmount() {
        return refundAmount;
    }

    public void setRefundAmount(BigDecimal refundAmount) {
        this.refundAmount = refundAmount;
    }

    public String getRefundReason() {
        return refundReason;
    }

    public void setRefundReason(String refundReason) {
        this.refundReason = refundReason;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        Payment payment = (Payment) o;
        return Objects.equals(id, payment.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "Payment{" +
                "id=" + id +
                ", booking=" + booking +
                ", amount=" + amount +
                ", status=" + status +
                '}';
    }
}
