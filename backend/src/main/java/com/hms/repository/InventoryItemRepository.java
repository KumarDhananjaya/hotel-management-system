package com.hms.repository;

import com.hms.model.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {
    // Find items where quantity is less than or equal to reorder level
    List<InventoryItem> findByQuantityLessThanEqual(Integer reorderLevel);
}
