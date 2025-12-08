package com.hms.config;

import com.hms.model.TaxConfiguration;
import com.hms.repository.TaxConfigurationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.time.LocalDate;

@Component
public class TaxDataSeeder implements CommandLineRunner {

    @Autowired
    private TaxConfigurationRepository taxConfigRepository;

    @Override
    public void run(String... args) throws Exception {
        if (taxConfigRepository.count() == 0) {
            seedSampleTaxData();
        }
    }

    private void seedSampleTaxData() {
        // New York City Example
        TaxConfiguration nyc = new TaxConfiguration("NY", "New York", "New York");
        nyc.setStateSalesTaxRate(new BigDecimal("0.0400")); // 4% state sales tax
        nyc.setCountyOccupancyTaxRate(new BigDecimal("0.0575")); // 5.75% county hotel tax
        nyc.setCityOccupancyTaxRate(new BigDecimal("0.0375")); // 3.75% city hotel tax
        nyc.setResortFeeRate(new BigDecimal("0.0200")); // 2% resort fee
        nyc.setEffectiveDate(LocalDate.of(2024, 1, 1));
        taxConfigRepository.save(nyc);

        // Los Angeles Example
        TaxConfiguration la = new TaxConfiguration("CA", "Los Angeles", "Los Angeles");
        la.setStateSalesTaxRate(new BigDecimal("0.0725")); // 7.25% state sales tax
        la.setCountyOccupancyTaxRate(new BigDecimal("0.0200")); // 2% county tax
        la.setCityOccupancyTaxRate(new BigDecimal("0.1400")); // 14% city transient occupancy tax
        la.setResortFeeRate(new BigDecimal("0.0150")); // 1.5% resort fee
        la.setEffectiveDate(LocalDate.of(2024, 1, 1));
        taxConfigRepository.save(la);

        // Miami Example
        TaxConfiguration miami = new TaxConfiguration("FL", "Miami-Dade", "Miami");
        miami.setStateSalesTaxRate(new BigDecimal("0.0600")); // 6% state sales tax
        miami.setCountyOccupancyTaxRate(new BigDecimal("0.0600")); // 6% tourist development tax
        miami.setCityOccupancyTaxRate(new BigDecimal("0.0200")); // 2% convention development tax
        miami.setResortFeeRate(new BigDecimal("0.0300")); // 3% resort fee
        miami.setEffectiveDate(LocalDate.of(2024, 1, 1));
        taxConfigRepository.save(miami);

        // Texas (No State Income Tax, but has hotel occupancy tax)
        TaxConfiguration houston = new TaxConfiguration("TX", "Harris", "Houston");
        houston.setStateSalesTaxRate(new BigDecimal("0.0625")); // 6.25% state sales tax
        houston.setCountyOccupancyTaxRate(new BigDecimal("0.0200")); // 2% county hotel tax
        houston.setCityOccupancyTaxRate(new BigDecimal("0.0700")); // 7% city hotel occupancy tax
        houston.setResortFeeRate(new BigDecimal("0.0100")); // 1% resort fee
        houston.setEffectiveDate(LocalDate.of(2024, 1, 1));
        taxConfigRepository.save(houston);

        // Nevada (Las Vegas - High Resort Fees)
        TaxConfiguration lasVegas = new TaxConfiguration("NV", "Clark", "Las Vegas");
        lasVegas.setStateSalesTaxRate(new BigDecimal("0.0685")); // 6.85% state sales tax
        lasVegas.setCountyOccupancyTaxRate(new BigDecimal("0.0500")); // 5% county tax
        lasVegas.setCityOccupancyTaxRate(new BigDecimal("0.0700")); // 7% city tax
        lasVegas.setResortFeeRate(new BigDecimal("0.0500")); // 5% resort fee (high for Vegas)
        lasVegas.setEffectiveDate(LocalDate.of(2024, 1, 1));
        taxConfigRepository.save(lasVegas);

        System.out.println("✅ Seeded sample U.S. tax configurations for 5 major cities");
    }
}
