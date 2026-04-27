package com.training.vehiclerentalsystem.dto.booking;

import java.time.LocalDate;

public class BookingResponse {

    private UUID id;

    private UUID vehicleId;
    private String vehicleBrand;
    private String vehicleModel;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalPrice;
    private String paymentMethod;
    private BookingStatus status;
    private LocalDate createdAt;
}
