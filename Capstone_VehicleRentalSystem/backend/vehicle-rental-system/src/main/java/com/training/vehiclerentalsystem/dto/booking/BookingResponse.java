package com.training.vehiclerentalsystem.dto.booking;

import com.training.vehiclerentalsystem.enums.BookingStatus;
import com.training.vehiclerentalsystem.enums.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class BookingResponse {

    private UUID id;
    private UUID vehicleId;
    private String vehicleBrand;
    private String vehicleModel;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private BigDecimal totalPrice;
    private PaymentMethod paymentMethod;
    private BookingStatus status;
    private LocalDateTime createdAt;

    // Location details associated with the booking (pickup/drop address info)
    private LocationInfo location;

    @AllArgsConstructor
    @NoArgsConstructor
    @Data
    public static class LocationInfo {
        private String address;
        private String city;
        private String state;
        private String pincode;
    }
}
