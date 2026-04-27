package com.training.vehiclerentalsystem.dto.booking;

import com.training.vehiclerentalsystem.enums.BookingStatus;
import com.training.vehiclerentalsystem.model.User;
import com.training.vehiclerentalsystem.model.Vehicle;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
public class BookingRequest {

    @NotNull(message = "vehicle id is required")
    private UUID vehicleId;

    @NotNull(message = "start date is required")
    private LocalDate startDate;

    @NotNull(message = "end date is required")
    private LocalDate endDate;

    @NotBlank(message = "payment method is required")
    private PaymentMethod paymentMethod;

}
