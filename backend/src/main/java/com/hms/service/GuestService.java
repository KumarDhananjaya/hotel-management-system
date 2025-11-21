package com.hms.service;

import com.hms.model.Guest;
import com.hms.repository.GuestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class GuestService {

    @Autowired
    private GuestRepository guestRepository;

    public List<Guest> getAllGuests() {
        return guestRepository.findAll();
    }

    public Guest addGuest(Guest guest) {
        return guestRepository.save(guest);
    }

    public Guest updateGuest(Long id, Guest guestDetails) {
        Guest guest = guestRepository.findById(id).orElseThrow(() -> new RuntimeException("Guest not found"));
        guest.setName(guestDetails.getName());
        guest.setPhone(guestDetails.getPhone());
        guest.setEmail(guestDetails.getEmail());
        guest.setAddress(guestDetails.getAddress());
        return guestRepository.save(guest);
    }
}
