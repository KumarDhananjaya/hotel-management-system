package com.hms.config;

import com.hms.model.PromoCode;
import com.hms.repository.PromoCodeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.time.LocalDate;

@Component
@Order(2)
public class PromoCodeSeeder implements CommandLineRunner {

    @Autowired
    private PromoCodeRepository promoCodeRepository;

    @Override
    public void run(String... args) throws Exception {
        if (promoCodeRepository.count() == 0) {
            seedSamplePromoCodes();
        }
    }

    private void seedSamplePromoCodes() {
        // AAA Member Discount
        PromoCode aaa = new PromoCode();
        aaa.setCode("AAA2024");
        aaa.setDescription("AAA Member Discount - 10% off");
        aaa.setDiscountType(PromoCode.DiscountType.PERCENTAGE);
        aaa.setDiscountValue(new BigDecimal("10"));
        aaa.setMembershipType(PromoCode.MembershipType.AAA);
        aaa.setValidFrom(LocalDate.of(2024, 1, 1));
        aaa.setValidUntil(LocalDate.of(2024, 12, 31));
        aaa.setIsActive(true);
        promoCodeRepository.save(aaa);

        // AARP Senior Discount
        PromoCode aarp = new PromoCode();
        aarp.setCode("AARP15");
        aarp.setDescription("AARP Senior Discount - 15% off");
        aarp.setDiscountType(PromoCode.DiscountType.PERCENTAGE);
        aarp.setDiscountValue(new BigDecimal("15"));
        aarp.setMembershipType(PromoCode.MembershipType.AARP);
        aarp.setValidFrom(LocalDate.of(2024, 1, 1));
        aarp.setValidUntil(LocalDate.of(2024, 12, 31));
        aarp.setIsActive(true);
        promoCodeRepository.save(aarp);

        // Military Discount
        PromoCode military = new PromoCode();
        military.setCode("MILITARY20");
        military.setDescription("Military & Veterans Discount - 20% off");
        military.setDiscountType(PromoCode.DiscountType.PERCENTAGE);
        military.setDiscountValue(new BigDecimal("20"));
        military.setMembershipType(PromoCode.MembershipType.MILITARY);
        military.setValidFrom(LocalDate.of(2024, 1, 1));
        military.setValidUntil(LocalDate.of(2024, 12, 31));
        military.setIsActive(true);
        promoCodeRepository.save(military);

        // Corporate Rate
        PromoCode corporate = new PromoCode();
        corporate.setCode("CORP2024");
        corporate.setDescription("Corporate Rate - $50 off");
        corporate.setDiscountType(PromoCode.DiscountType.FIXED_AMOUNT);
        corporate.setDiscountValue(new BigDecimal("50"));
        corporate.setMembershipType(PromoCode.MembershipType.CORPORATE);
        corporate.setMinStayNights(2);
        corporate.setValidFrom(LocalDate.of(2024, 1, 1));
        corporate.setValidUntil(LocalDate.of(2024, 12, 31));
        corporate.setIsActive(true);
        promoCodeRepository.save(corporate);

        // Government Rate
        PromoCode government = new PromoCode();
        government.setCode("GOV2024");
        government.setDescription("Government Employee Rate - 12% off");
        government.setDiscountType(PromoCode.DiscountType.PERCENTAGE);
        government.setDiscountValue(new BigDecimal("12"));
        government.setMembershipType(PromoCode.MembershipType.GOVERNMENT);
        government.setValidFrom(LocalDate.of(2024, 1, 1));
        government.setValidUntil(LocalDate.of(2024, 12, 31));
        government.setIsActive(true);
        promoCodeRepository.save(government);

        // Early Bird Special (Limited Use)
        PromoCode earlyBird = new PromoCode();
        earlyBird.setCode("EARLYBIRD");
        earlyBird.setDescription("Early Bird Special - $75 off");
        earlyBird.setDiscountType(PromoCode.DiscountType.FIXED_AMOUNT);
        earlyBird.setDiscountValue(new BigDecimal("75"));
        earlyBird.setMembershipType(PromoCode.MembershipType.NONE);
        earlyBird.setMinStayNights(3);
        earlyBird.setMaxUses(100);
        earlyBird.setValidFrom(LocalDate.now());
        earlyBird.setValidUntil(LocalDate.now().plusMonths(3));
        earlyBird.setIsActive(true);
        promoCodeRepository.save(earlyBird);

        System.out.println("✅ Seeded 6 sample promo codes (AAA, AARP, Military, Corporate, Government, Early Bird)");
    }
}
