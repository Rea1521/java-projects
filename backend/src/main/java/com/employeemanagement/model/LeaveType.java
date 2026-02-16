package com.employeemanagement.model;

public enum LeaveType {
    SICK_LEAVE("Sick Leave", 12),
    CASUAL_LEAVE("Casual Leave", 10),
    PAID_LEAVE("Paid Leave", 15),
    MATERNITY_LEAVE("Maternity Leave", 90),
    PATERNITY_LEAVE("Paternity Leave", 15),
    UNPAID_LEAVE("Unpaid Leave", 0);

    private String displayName;
    private int defaultDays;

    LeaveType(String displayName, int defaultDays) {
        this.displayName = displayName;
        this.defaultDays = defaultDays;
    }

    public String getDisplayName() {
        return displayName;
    }

    public int getDefaultDays() {
        return defaultDays;
    }
}
