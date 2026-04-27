package com.training.vehiclerentalsystem.dto.booking;

import com.training.vehiclerentalsystem.enums.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class BookingRequest {

    @NotNull(message = "vehicle id is required")
    private UUID vehicleId;

    @NotNull(message = "start date is required")
    private LocalDateTime startDate;

    @NotNull(message = "end date is required")
    private LocalDateTime endDate;

    @NotNull(message = "payment method is required")
    private PaymentMethod paymentMethod;

}
