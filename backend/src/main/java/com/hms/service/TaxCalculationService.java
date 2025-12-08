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

    /**
     * Calculate all applicable U.S. taxes for a hotel stay
     * 
     * @param subtotal  Room charges before tax
     * @param stateCode Two-letter state code (e.g., "NY", "CA")
     * @param county    County name
     * @param city      City name
     * @return Map containing all tax breakdowns
     */
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

        // Calculate total tax
        BigDecimal totalTax = stateTax.add(countyTax).add(cityTax).add(resortFee);

        // Calculate grand total
        BigDecimal grandTotal = subtotal.add(totalTax);

        taxes.put("subtotal", subtotal);
        taxes.put("stateTax", stateTax);
        taxes.put("stateTaxRate", config.getStateSalesTaxRate().multiply(new BigDecimal("100")));
        taxes.put("countyTax", countyTax);
        taxes.put("countyTaxRate", config.getCountyOccupancyTaxRate().multiply(new BigDecimal("100")));
        taxes.put("cityTax", cityTax);
        taxes.put("cityTaxRate", config.getCityOccupancyTaxRate().multiply(new BigDecimal("100")));
        taxes.put("resortFee", resortFee);
        taxes.put("resortFeeRate", config.getResortFeeRate().multiply(new BigDecimal("100")));
        taxes.put("totalTax", totalTax);
        taxes.put("grandTotal", grandTotal);

        return taxes;
    }

    /**
     * Get default tax configuration (no taxes)
     * Used when no specific configuration is found
     */
    private TaxConfiguration getDefaultConfiguration() {
        TaxConfiguration config = new TaxConfiguration();
        config.setStateSalesTaxRate(BigDecimal.ZERO);
        config.setCountyOccupancyTaxRate(BigDecimal.ZERO);
        config.setCityOccupancyTaxRate(BigDecimal.ZERO);
        config.setResortFeeRate(BigDecimal.ZERO);
        return config;
    }

    /**
     * Calculate service charge (typically 15-20% for room service, etc.)
     */
    public BigDecimal calculateServiceCharge(BigDecimal amount, BigDecimal rate) {
        return amount.multiply(rate).setScale(2, RoundingMode.HALF_UP);
    }
}
