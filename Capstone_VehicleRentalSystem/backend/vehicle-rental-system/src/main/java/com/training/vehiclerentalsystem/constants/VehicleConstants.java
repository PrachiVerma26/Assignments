package com.training.vehiclerentalsystem.constants;

public class VehicleConstants {

    private VehicleConstants() {}

    // paths
    public static final String PUBLIC_BASE = ApiConstants.API + "/vehicles";
    public static final String ADMIN_BASE = ApiConstants.ADMIN + "/vehicles";

    // relative paths
    public static final String BY_ID = "/{id}";
    public static final String FILTER = "/filter";
    public static final String AVAILABLE = "/available";
    public static final String BY_TYPE = "/type/{type}";
    public static final String BY_LOCATION = "/location/{locationId}";
    public static final String AVAILABLE_BY_DATES ="/available-by-dates" ;

    // path variables
    public static final String ID = "id";
    public static final String TYPE = "type";
    public static final String LOCATION_ID = "locationId";

    // query params
    public static final String PARAM_TYPE = "type";
    public static final String PARAM_STATUS = "status";
    public static final String PARAM_LOCATION_ID = "locationId";

    // messages
    public static final String VEHICLE_NOT_FOUND = "Vehicle not found with id: ";
    public static final String LOCATION_NOT_FOUND = "Location not found with id: ";
    public static final String VEHICLE_DELETE_NOT_ALLOWED = "Cannot delete vehicle with active bookings";
}
