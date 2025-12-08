package com.hms.repository;

import com.hms.model.PromoCode;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.Optional;

public interface PromoCodeRepository extends JpaRepository<PromoCode, Long> {
    Optional<PromoCode> findByCodeAndIsActiveTrue(String code);

    default Optional<PromoCode> findValidPromoCode(String code, LocalDate date) {
        return findByCodeAndIsActiveTrue(code)
                .filter(promo -> !date.isBefore(promo.getValidFrom()) &&
                        !date.isAfter(promo.getValidUntil()))
                .filter(promo -> promo.getMaxUses() == null ||
                        promo.getCurrentUses() < promo.getMaxUses());
    }
}
