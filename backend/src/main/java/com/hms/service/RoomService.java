package com.hms.service;

import com.hms.model.Room;
import com.hms.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class RoomService {

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private com.hms.repository.BookingRepository bookingRepository;

    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    public Room getRoomById(Long id) {
        return roomRepository.findById(id).orElseThrow(() -> new RuntimeException("Room not found"));
    }

    public Room addRoom(Room room) {
        if (roomRepository.existsByRoomNumber(room.getRoomNumber())) {
            throw new RuntimeException("Room number already exists");
        }
        return roomRepository.save(room);
    }

    public Room updateRoom(Long id, Room roomDetails) {
        Room room = getRoomById(id);
        room.setRoomNumber(roomDetails.getRoomNumber());
        room.setType(roomDetails.getType());
        room.setPrice(roomDetails.getPrice());
        room.setStatus(roomDetails.getStatus());
        room.setDescription(roomDetails.getDescription());
        return roomRepository.save(room);
    }

    public void deleteRoom(Long id) {
        roomRepository.deleteById(id);
    }

    /**
     * Finds available rooms for a given date range and optional room type.
     * Checks if the room is currently available (status) and not booked during the
     * requested dates.
     *
     * @param checkIn  Desired check-in date
     * @param checkOut Desired check-out date
     * @param type     Optional room type filter
     * @return List of available rooms
     */
    public List<Room> findAvailableRooms(java.time.LocalDate checkIn, java.time.LocalDate checkOut,
            Room.RoomType type) {
        List<Room> allRooms = roomRepository.findAll();

        return allRooms.stream()
                .filter(room -> {
                    // 1. Check if room status is AVAILABLE
                    if (room.getStatus() != Room.RoomStatus.AVAILABLE) {
                        return false;
                    }

                    // 2. Check if room type matches (if provided)
                    if (type != null && room.getType() != type) {
                        return false;
                    }

                    // 3. Check for booking conflicts
                    List<com.hms.model.Booking> conflicts = bookingRepository.findBookingsInDateRange(room.getId(),
                            checkIn, checkOut);
                    return conflicts.isEmpty();
                })
                .collect(java.util.stream.Collectors.toList());
    }
}
