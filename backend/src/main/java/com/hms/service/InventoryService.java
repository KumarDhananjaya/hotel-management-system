package com.hms.service;

import com.hms.model.InventoryItem;
import com.hms.model.InventoryLog;
import com.hms.model.User;
import com.hms.repository.InventoryItemRepository;
import com.hms.repository.InventoryLogRepository;
import com.hms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InventoryService {

    @Autowired
    private InventoryItemRepository itemRepository;

    @Autowired
    private InventoryLogRepository logRepository;

    @Autowired
    private UserRepository userRepository;

    public List<InventoryItem> getAllItems() {
        return itemRepository.findAll();
    }

    public List<InventoryItem> getLowStockItems() {
        // This is a bit inefficient if we have many items, but fine for now.
        // A custom query would be better: "WHERE quantity <= reorderLevel"
        // But JpaRepository method findByQuantityLessThanEqual takes a static value,
        // not a column comparison.
        // So we filter in memory or write a custom @Query.
        // Let's use simple filtering for now.
        return itemRepository.findAll().stream()
                .filter(item -> item.getQuantity() <= item.getReorderLevel())
                .collect(Collectors.toList());
    }

    public InventoryItem addItem(InventoryItem item) {
        return itemRepository.save(item);
    }

    public InventoryItem updateStock(Long itemId, int quantityChange, InventoryLog.LogType type, String reason) {
        InventoryItem item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        int newQuantity = item.getQuantity() + quantityChange;
        if (newQuantity < 0) {
            throw new RuntimeException("Insufficient stock");
        }
        item.setQuantity(newQuantity);
        InventoryItem savedItem = itemRepository.save(item);

        // Log the change
        User user = getCurrentUser();
        InventoryLog log = new InventoryLog(savedItem, type, quantityChange, reason, user);
        logRepository.save(log);

        return savedItem;
    }

    public List<InventoryLog> getAllLogs() {
        return logRepository.findAllByOrderByTimestampDesc();
    }

    public InventoryItem getItemById(Long id) {
        return itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found with id: " + id));
    }

    public InventoryItem updateItem(Long id, InventoryItem updatedItem) {
        InventoryItem existingItem = itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found with id: " + id));

        existingItem.setName(updatedItem.getName());
        existingItem.setQuantity(updatedItem.getQuantity());
        existingItem.setReorderLevel(updatedItem.getReorderLevel());
        existingItem.setPrice(updatedItem.getPrice());

        return itemRepository.save(existingItem);
    }

    public void deleteItem(Long id) {
        if (!itemRepository.existsById(id)) {
            throw new RuntimeException("Item not found with id: " + id);
        }
        itemRepository.deleteById(id);
    }

    private User getCurrentUser() {
        try {
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            String email;
            if (principal instanceof UserDetails) {
                email = ((UserDetails) principal).getUsername();
            } else {
                email = principal.toString();
            }
            return userRepository.findByEmail(email).orElse(null);
        } catch (Exception e) {
            return null;
        }
    }
}
