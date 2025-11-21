package com.hms.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "rooms")
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String roomNumber;

    @Enumerated(EnumType.STRING)
    private RoomType type;

    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    private RoomStatus status;

    private String description;

    public enum RoomType {
        SINGLE, DOUBLE, SUITE
    }

    public enum RoomStatus {
        AVAILABLE, BOOKED, MAINTENANCE
    }
}
