package com.hms.controller;

import com.hms.model.Guest;
import com.hms.service.GuestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/guests")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174" })
public class GuestController {

    @Autowired
    private GuestService guestService;

    @GetMapping
    public List<Guest> getAllGuests() {
        return guestService.getAllGuests();
    }

    @PostMapping
    public Guest addGuest(@RequestBody Guest guest) {
        return guestService.addGuest(guest);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Guest> updateGuest(@PathVariable Long id, @RequestBody Guest guest) {
        try {
            return ResponseEntity.ok(guestService.updateGuest(id, guest));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
