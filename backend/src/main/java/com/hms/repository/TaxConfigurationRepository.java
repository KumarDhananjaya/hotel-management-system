package com.hms.repository;

import com.hms.model.TaxConfiguration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.Optional;

public interface TaxConfigurationRepository extends JpaRepository<TaxConfiguration, Long> {

    @Query("SELECT t FROM TaxConfiguration t WHERE " +
            "t.stateCode = :stateCode AND " +
            "(t.county = :county OR t.county IS NULL) AND " +
            "(t.city = :city OR t.city IS NULL) AND " +
            "t.effectiveDate <= :date AND " +
            "(t.expiryDate IS NULL OR t.expiryDate >= :date) " +
            "ORDER BY t.city DESC, t.county DESC, t.effectiveDate DESC")
    Optional<TaxConfiguration> findActiveConfiguration(
            @Param("stateCode") String stateCode,
            @Param("county") String county,
            @Param("city") String city,
            @Param("date") LocalDate date);
}
