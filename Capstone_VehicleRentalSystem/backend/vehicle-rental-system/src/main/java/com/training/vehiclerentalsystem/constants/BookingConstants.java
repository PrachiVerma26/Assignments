package com.training.vehiclerentalsystem.constants;

public class BookingConstants {

    private BookingConstants(){}

    public static final String CUSTOMER_BOOKINGS_API= ApiConstants.CUSTOMER + "/bookings";
    public static final String ADMIN_BOOKINGS_API = ApiConstants.ADMIN + "/bookings";
    public static final String CANCEL = "/{id}/cancel";
    public static final String BY_ID = "/{id}";
    public static final String ID = "id";
    public static final String INVALID_DATE_RANGE = "Start date must be before end date";
    public static final String PAST_BOOKING_NOT_ALLOWED = "Cannot book past dates";
    public static final String VEHICLE_ALREADY_BOOKED = "Vehicle already booked for selected dates";
    public static final String BOOKING_NOT_FOUND = "Booking not found";
    public static final String BOOKING_ALREADY_CANCELLED = "Booking already cancelled";
}
