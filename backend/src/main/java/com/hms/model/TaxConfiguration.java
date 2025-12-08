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
    private String stateCode; // e.g., "NY", "CA", "TX"

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

    public TaxConfiguration() {
    }

    public TaxConfiguration(String stateCode, String county, String city) {
        this.stateCode = stateCode;
        this.county = county;
        this.city = city;
        this.effectiveDate = LocalDate.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getStateCode() {
        return stateCode;
    }

    public void setStateCode(String stateCode) {
        this.stateCode = stateCode;
    }

    public String getCounty() {
        return county;
    }

    public void setCounty(String county) {
        this.county = county;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public BigDecimal getStateSalesTaxRate() {
        return stateSalesTaxRate;
    }

    public void setStateSalesTaxRate(BigDecimal stateSalesTaxRate) {
        this.stateSalesTaxRate = stateSalesTaxRate;
    }

    public BigDecimal getCountyOccupancyTaxRate() {
        return countyOccupancyTaxRate;
    }

    public void setCountyOccupancyTaxRate(BigDecimal countyOccupancyTaxRate) {
        this.countyOccupancyTaxRate = countyOccupancyTaxRate;
    }

    public BigDecimal getCityOccupancyTaxRate() {
        return cityOccupancyTaxRate;
    }

    public void setCityOccupancyTaxRate(BigDecimal cityOccupancyTaxRate) {
        this.cityOccupancyTaxRate = cityOccupancyTaxRate;
    }

    public BigDecimal getResortFeeRate() {
        return resortFeeRate;
    }

    public void setResortFeeRate(BigDecimal resortFeeRate) {
        this.resortFeeRate = resortFeeRate;
    }

    public LocalDate getEffectiveDate() {
        return effectiveDate;
    }

    public void setEffectiveDate(LocalDate effectiveDate) {
        this.effectiveDate = effectiveDate;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }
}
