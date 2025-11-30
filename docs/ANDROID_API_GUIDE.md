# 📱 Android API Integration Guide

**Employee Management System (EMS) - Complete Android/Java Guide**

This guide is designed for Android developers who want to integrate with the EMS backend API. Everything is explained step-by-step with complete working examples!

---

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Project Setup](#project-setup)
3. [Data Models](#data-models)
4. [API Service Interface](#api-service-interface)
5. [Retrofit Client](#retrofit-client)
6. [Session Management](#session-management)
7. [Authentication Examples](#authentication-examples)
8. [Branch Selection Flow](#branch-selection-flow)
9. [Feature Examples](#feature-examples)
10. [Real-time with Socket.IO](#real-time-with-socketio)
11. [Testing & Troubleshooting](#testing--troubleshooting)

---

## 🎯 Getting Started

### Base URL

- **Production (Deployed on Azure):** `https://emsbackend-enh5aahkg4dcfkfs.southeastasia-01.azurewebsites.net/api/v1/`
- **Development (Emulator):** `http://10.0.2.2:5000/api/v1/`
- **Development (Physical Device - same WiFi):** `http://YOUR_PC_IP:5000/api/v1/`

### What You Need to Know

1. **Authentication** - Most endpoints require JWT token
2. **Retrofit** - Used for HTTP requests
3. **OkHttp** - Used for interceptors and logging
4. **Gson** - Used for JSON parsing
5. **Socket.IO** - Used for real-time features

### API Response Pattern

**Success Response:**

```json
{
  "message": "Success message here",
  "data": {
    // Your actual data here
  }
}
```

**Error Response:**

```json
{
  "message": "Error message here",
  "errorCode": "ERROR_TYPE"
}
```

---

## 🔧 Project Setup

### 1. Add Dependencies to `build.gradle` (app level)

```gradle
dependencies {
    // Retrofit for API calls
    implementation 'com.squareup.retrofit2:retrofit:2.9.0'
    implementation 'com.squareup.retrofit2:converter-gson:2.9.0'

    // OkHttp for interceptors and logging
    implementation 'com.squareup.okhttp3:okhttp:4.11.0'
    implementation 'com.squareup.okhttp3:logging-interceptor:4.11.0'

    // Gson for JSON parsing
    implementation 'com.google.code.gson:gson:2.10.1'

    // Socket.IO for real-time features
    implementation 'io.socket:socket.io-client:2.1.0'

    // Google Play Services (for GPS location)
    implementation 'com.google.android.gms:play-services-location:21.0.1'

    // Optional: RecyclerView for lists
    implementation 'androidx.recyclerview:recyclerview:1.3.2'
}
```

### 2. Add Permissions to `AndroidManifest.xml`

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.yourcompany.ems">

    <!-- Internet permission (required) -->
    <uses-permission android:name="android.permission.INTERNET" />

    <!-- Location permission (for check-in/check-out) -->
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

    <application
        android:name=".EMSApplication"
        android:networkSecurityConfig="@xml/network_security_config"
        ...>
        <!-- Your activities here -->
    </application>
</manifest>
```

### 3. Network Security Config

**✅ For Production (HTTPS):** Since the backend is now deployed on Azure with HTTPS, you don't need to configure anything special. Android allows HTTPS by default.

**⚠️ For Local Development (HTTP):** If you want to test with local development server, create `res/xml/network_security_config.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <!-- Allow cleartext (HTTP) for local development only -->
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">10.0.2.2</domain>
        <domain includeSubdomains="true">localhost</domain>
        <domain includeSubdomains="true">192.168.1.100</domain>
    </domain-config>

    <!-- Production uses HTTPS by default - no config needed -->
</network-security-config>
```

**Note:** When using the production URL (`https://emsbackend-enh5aahkg4dcfkfs.southeastasia-01.azurewebsites.net`), you can remove the `android:networkSecurityConfig` line from your `AndroidManifest.xml` or keep the config file but it won't affect HTTPS connections.

---

## 📦 Data Models

Create a package `com.yourcompany.ems.models` and add these classes:

### LoginRequest.java

```java
package com.yourcompany.ems.models;

public class LoginRequest {
    private String email;  // Can be email OR username
    private String password;

    public LoginRequest(String email, String password) {
        this.email = email;
        this.password = password;
    }

    // Getters and Setters
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
```

### LoginResponse.java

```java
package com.yourcompany.ems.models;

public class LoginResponse {
    private String message;
    private Data data;

    public static class Data {
        private User user;
        private String accessToken;
        private String refreshToken;

        // Getters
        public User getUser() { return user; }
        public String getAccessToken() { return accessToken; }
        public String getRefreshToken() { return refreshToken; }
    }

    public static class User {
        private String id;
        private String username;
        private String email;
        private String name;
        private String role;
        private boolean isEmailVerified;

        // Getters
        public String getId() { return id; }
        public String getUsername() { return username; }
        public String getEmail() { return email; }
        public String getName() { return name; }
        public String getRole() { return role; }
        public boolean isEmailVerified() { return isEmailVerified; }
    }

    // Getters
    public String getMessage() { return message; }
    public Data getData() { return data; }
}
```

### ApiResponse.java (Generic wrapper for all API responses)

```java
package com.yourcompany.ems.models;

public class ApiResponse<T> {
    private String message;
    private T data;

    public String getMessage() { return message; }
    public T getData() { return data; }
}
```

### Employee.java

```java
package com.yourcompany.ems.models;

public class Employee {
    private String id;
    private String name;
    private String username;
    private String email;
    private String role;
    private String phone;
    private String branchId;
    private boolean isEmailVerified;
    private String createdAt;
    private String updatedAt;

    // Constructor
    public Employee() {}

    // Full constructor for creating new employee
    public Employee(String name, String username, String email, String password,
                   String role, String phone, String branchId) {
        this.name = name;
        this.username = username;
        this.email = email;
        this.role = role;
        this.phone = phone;
        this.branchId = branchId;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getBranchId() { return branchId; }
    public void setBranchId(String branchId) { this.branchId = branchId; }

    public boolean isEmailVerified() { return isEmailVerified; }
    public void setEmailVerified(boolean emailVerified) { isEmailVerified = emailVerified; }

    public String getCreatedAt() { return createdAt; }
    public String getUpdatedAt() { return updatedAt; }
}
```

### EmployeeListData.java

```java
package com.yourcompany.ems.models;

import java.util.List;

public class EmployeeListData {
    private List<Employee> employees;
    private Pagination pagination;

    public static class Pagination {
        private int currentPage;
        private int totalPages;
        private int totalItems;
        private int limit;

        // Getters
        public int getCurrentPage() { return currentPage; }
        public int getTotalPages() { return totalPages; }
        public int getTotalItems() { return totalItems; }
        public int getLimit() { return limit; }
    }

    // Getters
    public List<Employee> getEmployees() { return employees; }
    public Pagination getPagination() { return pagination; }
}
```

### Branch.java

```java
package com.yourcompany.ems.models;

public class Branch {
    private String id;
    private String name;
    private String address;
    private Location location;
    private String createdAt;

    public static class Location {
        private double latitude;
        private double longitude;
        private int radius;

        // Getters
        public double getLatitude() { return latitude; }
        public double getLongitude() { return longitude; }
        public int getRadius() { return radius; }
    }

    // Getters
    public String getId() { return id; }
    public String getName() { return name; }
    public String getAddress() { return address; }
    public Location getLocation() { return location; }
    public String getCreatedAt() { return createdAt; }
}
```

### Attendance.java

```java
package com.yourcompany.ems.models;

public class Attendance {
    private String id;
    private String employeeId;
    private String branchId;
    private String shiftId;
    private String date;
    private CheckInData checkIn;
    private CheckOutData checkOut;
    private String status;
    private int hoursWorked;

    public static class CheckInData {
        private String time;
        private Location location;

        public static class Location {
            private double latitude;
            private double longitude;

            public double getLatitude() { return latitude; }
            public double getLongitude() { return longitude; }
        }

        public String getTime() { return time; }
        public Location getLocation() { return location; }
    }

    public static class CheckOutData {
        private String time;
        private Location location;

        public static class Location {
            private double latitude;
            private double longitude;

            public double getLatitude() { return latitude; }
            public double getLongitude() { return longitude; }
        }

        public String getTime() { return time; }
        public Location getLocation() { return location; }
    }

    // Getters
    public String getId() { return id; }
    public String getEmployeeId() { return employeeId; }
    public String getDate() { return date; }
    public CheckInData getCheckIn() { return checkIn; }
    public CheckOutData getCheckOut() { return checkOut; }
    public String getStatus() { return status; }
    public int getHoursWorked() { return hoursWorked; }
}
```

### CheckInRequest.java

```java
package com.yourcompany.ems.models;

public class CheckInRequest {
    private double latitude;
    private double longitude;

    public CheckInRequest(double latitude, double longitude) {
        this.latitude = latitude;
        this.longitude = longitude;
    }

    // Getters
    public double getLatitude() { return latitude; }
    public double getLongitude() { return longitude; }
}
```

### Notification.java

```java
package com.yourcompany.ems.models;

public class Notification {
    private String id;
    private String recipientId;
    private String senderId;
    private String title;
    private String message;
    private String type;
    private boolean isRead;
    private String createdAt;

    // Getters
    public String getId() { return id; }
    public String getTitle() { return title; }
    public String getMessage() { return message; }
    public String getType() { return type; }
    public boolean isRead() { return isRead; }
    public String getCreatedAt() { return createdAt; }
}
```

### BranchListData.java

```java
package com.yourcompany.ems.models;

import java.util.List;

public class BranchListData {
    private List<Branch> branches;

    public List<Branch> getBranches() {
        return branches;
    }

    public void setBranches(List<Branch> branches) {
        this.branches = branches;
    }
}
```

### Shift.java

```java
package com.yourcompany.ems.models;

public class Shift {
    private String id;
    private String shiftName;
    private String startTime;
    private String endTime;
    private String branchId;
    private String createdAt;

    // Getters
    public String getId() { return id; }
    public String getShiftName() { return shiftName; }
    public String getStartTime() { return startTime; }
    public String getEndTime() { return endTime; }
    public String getBranchId() { return branchId; }
    public String getCreatedAt() { return createdAt; }
}
```

### ShiftListData.java

```java
package com.yourcompany.ems.models;

import java.util.List;

public class ShiftListData {
    private List<Shift> shifts;

    public List<Shift> getShifts() {
        return shifts;
    }

    public void setShifts(List<Shift> shifts) {
        this.shifts = shifts;
    }
}
```

### ShiftRegistration.java

```java
package com.yourcompany.ems.models;

public class ShiftRegistration {
    private String id;
    private String employeeId;
    private String shiftId;
    private Shift shift; // Populated shift data
    private String date;
    private String status; // "pending", "approved", "rejected"
    private String note;
    private String createdAt;

    // Getters
    public String getId() { return id; }
    public String getEmployeeId() { return employeeId; }
    public String getShiftId() { return shiftId; }
    public Shift getShift() { return shift; }
    public String getDate() { return date; }
    public String getStatus() { return status; }
    public String getNote() { return note; }
    public String getCreatedAt() { return createdAt; }
}
```

### ShiftRegistrationListData.java

```java
package com.yourcompany.ems.models;

import java.util.List;

public class ShiftRegistrationListData {
    private List<ShiftRegistration> registrations;
    private Pagination pagination;

    public static class Pagination {
        private int currentPage;
        private int totalPages;
        private int totalItems;
        private int limit;

        // Getters
        public int getCurrentPage() { return currentPage; }
        public int getTotalPages() { return totalPages; }
        public int getTotalItems() { return totalItems; }
        public int getLimit() { return limit; }
    }

    // Getters
    public List<ShiftRegistration> getRegistrations() { return registrations; }
    public Pagination getPagination() { return pagination; }
}
```

### CreateShiftRegistrationRequest.java

```java
package com.yourcompany.ems.models;

public class CreateShiftRegistrationRequest {
    private String shiftId;
    private String date; // ISO format: "2025-11-09"
    private String note;

    public CreateShiftRegistrationRequest(String shiftId, String date, String note) {
        this.shiftId = shiftId;
        this.date = date;
        this.note = note;
    }

    // Getters
    public String getShiftId() { return shiftId; }
    public String getDate() { return date; }
    public String getNote() { return note; }
}
```

---

## 🌐 API Service Interface

Create `com.yourcompany.ems.api.ApiService.java`:

```java
package com.yourcompany.ems.api;

import com.yourcompany.ems.models.*;
import retrofit2.Call;
import retrofit2.http.*;

public interface ApiService {

    // ==================== AUTHENTICATION ====================

    @POST("auth/login")
    Call<LoginResponse> login(@Body LoginRequest request);

    @POST("auth/logout")
    Call<ApiResponse<Void>> logout();

    @POST("auth/refresh-token")
    Call<LoginResponse> refreshToken(@Body RefreshTokenRequest request);

    @PUT("auth/update-email")
    Call<ApiResponse<LoginResponse.User>> updateEmail(@Body UpdateEmailRequest request);

    @POST("auth/verify-email")
    Call<ApiResponse<LoginResponse.User>> verifyEmail(@Body VerifyEmailRequest request);

    @POST("auth/resend-verification")
    Call<ApiResponse<Void>> resendVerification(@Body ResendVerificationRequest request);

    // ==================== EMPLOYEES ====================

    @GET("employees")
    Call<ApiResponse<EmployeeListData>> getEmployees(
        @Query("page") Integer page,
        @Query("limit") Integer limit,
        @Query("role") String role
    );

    @GET("employees/{id}")
    Call<ApiResponse<Employee>> getEmployeeById(@Path("id") String id);

    @POST("employees")
    Call<ApiResponse<Employee>> createEmployee(@Body Employee employee);

    @PUT("employees/{id}")
    Call<ApiResponse<Employee>> updateEmployee(
        @Path("id") String id,
        @Body Employee employee
    );

    @DELETE("employees/{id}")
    Call<ApiResponse<Void>> deleteEmployee(@Path("id") String id);

    @GET("employees/branch/{branchId}")
    Call<ApiResponse<EmployeeListData>> getEmployeesByBranch(
        @Path("branchId") String branchId
    );

    // ==================== BRANCHES ====================

    @GET("branches")
    Call<ApiResponse<BranchListData>> getBranches();

    @GET("branches/{id}")
    Call<ApiResponse<Branch>> getBranchById(@Path("id") String id);

    @POST("branches")
    Call<ApiResponse<Branch>> createBranch(@Body Branch branch);

    @PUT("branches/{id}")
    Call<ApiResponse<Branch>> updateBranch(@Path("id") String id, @Body Branch branch);

    @DELETE("branches/{id}")
    Call<ApiResponse<Void>> deleteBranch(@Path("id") String id);

    // ==================== SHIFTS ====================

    @GET("shifts")
    Call<ApiResponse<ShiftListData>> getShifts();

    @GET("shifts/{id}")
    Call<ApiResponse<Shift>> getShiftById(@Path("id") String id);

    @GET("shifts/branch/{branchId}")
    Call<ApiResponse<ShiftListData>> getShiftsByBranch(@Path("branchId") String branchId);

    // ==================== SHIFT REGISTRATIONS ====================

    @GET("shift-registrations")
    Call<ApiResponse<ShiftRegistrationListData>> getShiftRegistrations(
        @Query("page") Integer page,
        @Query("limit") Integer limit,
        @Query("status") String status,
        @Query("date") String date,
        @Query("employeeId") String employeeId
    );

    @POST("shift-registrations")
    Call<ApiResponse<ShiftRegistration>> createShiftRegistration(@Body CreateShiftRegistrationRequest request);

    @DELETE("shift-registrations/{id}")
    Call<ApiResponse<Void>> deleteShiftRegistration(@Path("id") String id);

    // ==================== ATTENDANCE ====================

    @POST("attendance/check-in")
    Call<ApiResponse<Attendance>> checkIn(@Body CheckInRequest request);

    @POST("attendance/check-out")
    Call<ApiResponse<Attendance>> checkOut(@Body CheckInRequest request);

    @GET("attendance")
    Call<ApiResponse<AttendanceListData>> getAllAttendance(
        @Query("page") Integer page,
        @Query("limit") Integer limit
    );

    @GET("attendance/employee/{employeeId}")
    Call<ApiResponse<AttendanceListData>> getEmployeeAttendance(
        @Path("employeeId") String employeeId
    );

    @GET("attendance/employee/{employeeId}/date-range")
    Call<ApiResponse<AttendanceListData>> getAttendanceByDateRange(
        @Path("employeeId") String employeeId,
        @Query("startDate") String startDate,
        @Query("endDate") String endDate
    );

    @GET("attendance/{id}")
    Call<ApiResponse<Attendance>> getAttendanceById(@Path("id") String id);

    @PUT("attendance/{id}")
    Call<ApiResponse<Attendance>> updateAttendance(
        @Path("id") String id,
        @Body Attendance attendance
    );

    @DELETE("attendance/{id}")
    Call<ApiResponse<Void>> deleteAttendance(@Path("id") String id);

    // ==================== NOTIFICATIONS ====================

    @GET("notifications")
    Call<ApiResponse<NotificationListData>> getNotifications();

    @PUT("notifications/{id}")
    Call<ApiResponse<Notification>> markNotificationAsRead(@Path("id") String id);

    @PUT("notifications/mark-all-read")
    Call<ApiResponse<Void>> markAllNotificationsAsRead();

    @DELETE("notifications/{id}")
    Call<ApiResponse<Void>> deleteNotification(@Path("id") String id);

    // ==================== MESSAGES ====================

    @GET("messages")
    Call<ApiResponse<MessageListData>> getConversations();

    @POST("messages")
    Call<ApiResponse<Message>> sendMessage(@Body SendMessageRequest request);

    @GET("messages/conversation/{userId}")
    Call<ApiResponse<MessageListData>> getConversationWithUser(
        @Path("userId") String userId
    );

    @DELETE("messages/{id}")
    Call<ApiResponse<Void>> deleteMessage(@Path("id") String id);

    @PUT("messages/mark-read/{conversationId}")
    Call<ApiResponse<Void>> markMessagesAsRead(@Path("conversationId") String conversationId);

    // ==================== PAYROLL ====================

    @GET("payroll")
    Call<ApiResponse<PayrollListData>> getAllPayrolls();

    @GET("payroll/employee/{employeeId}")
    Call<ApiResponse<PayrollListData>> getEmployeePayrolls(@Path("employeeId") String employeeId);

    @GET("payroll/{id}")
    Call<ApiResponse<Payroll>> getPayrollById(@Path("id") String id);

    @POST("payroll")
    Call<ApiResponse<Payroll>> createPayroll(@Body Payroll payroll);

    @PUT("payroll/{id}")
    Call<ApiResponse<Payroll>> updatePayroll(@Path("id") String id, @Body Payroll payroll);

    @DELETE("payroll/{id}")
    Call<ApiResponse<Void>> deletePayroll(@Path("id") String id);

    // ==================== VIOLATIONS ====================

    @GET("violations")
    Call<ApiResponse<ViolationListData>> getAllViolations();

    @GET("violations/employee/{employeeId}")
    Call<ApiResponse<ViolationListData>> getEmployeeViolations(@Path("employeeId") String employeeId);

    @GET("violations/{id}")
    Call<ApiResponse<Violation>> getViolationById(@Path("id") String id);

    @POST("violations")
    Call<ApiResponse<Violation>> createViolation(@Body Violation violation);

    @PUT("violations/{id}")
    Call<ApiResponse<Violation>> updateViolation(@Path("id") String id, @Body Violation violation);

    @DELETE("violations/{id}")
    Call<ApiResponse<Void>> deleteViolation(@Path("id") String id);
}
```

---

## 🔌 Retrofit Client

Create `com.yourcompany.ems.api.RetrofitClient.java`:

```java
package com.yourcompany.ems.api;

import android.content.Context;
import android.content.SharedPreferences;
import okhttp3.*;
import okhttp3.logging.HttpLoggingInterceptor;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

import java.io.IOException;

public class RetrofitClient {
    // Change this based on your environment
    private static final String BASE_URL = "https://emsbackend-enh5aahkg4dcfkfs.southeastasia-01.azurewebsites.net/api/v1/";
    // For local development (Emulator): "http://10.0.2.2:5000/api/v1/"
    // For local development (Physical Device): "http://YOUR_PC_IP:5000/api/v1/"
    // For production (Deployed): "https://emsbackend-enh5aahkg4dcfkfs.southeastasia-01.azurewebsites.net/api/v1/"

    private static RetrofitClient instance;
    private Retrofit retrofit;
    private Context context;

    private RetrofitClient(Context context) {
        this.context = context.getApplicationContext();

        // Logging Interceptor - shows API requests/responses in Logcat
        HttpLoggingInterceptor loggingInterceptor = new HttpLoggingInterceptor();
        loggingInterceptor.setLevel(HttpLoggingInterceptor.Level.BODY);

        // Auth Interceptor - automatically adds token to every request
        Interceptor authInterceptor = new Interceptor() {
            @Override
            public Response intercept(Chain chain) throws IOException {
                Request originalRequest = chain.request();

                // Get token from SharedPreferences
                SharedPreferences prefs = context.getSharedPreferences("EMS", Context.MODE_PRIVATE);
                String token = prefs.getString("accessToken", null);

                // Add Authorization header if token exists
                if (token != null && !token.isEmpty()) {
                    Request newRequest = originalRequest.newBuilder()
                        .header("Authorization", "Bearer " + token)
                        .header("Content-Type", "application/json")
                        .build();
                    return chain.proceed(newRequest);
                }

                return chain.proceed(originalRequest);
            }
        };

        // OkHttp Client with interceptors
        OkHttpClient okHttpClient = new OkHttpClient.Builder()
            .addInterceptor(authInterceptor)
            .addInterceptor(loggingInterceptor)
            .build();

        // Retrofit Instance
        retrofit = new Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build();
    }

    // Singleton pattern
    public static synchronized RetrofitClient getInstance(Context context) {
        if (instance == null) {
            instance = new RetrofitClient(context);
        }
        return instance;
    }

    // Get API service
    public ApiService getApiService() {
        return retrofit.create(ApiService.class);
    }
}
```

---

## 🔐 Session Management

Create `com.yourcompany.ems.utils.SessionManager.java`:

```java
package com.yourcompany.ems.utils;

import android.content.Context;
import android.content.SharedPreferences;
import com.google.gson.Gson;
import com.yourcompany.ems.models.LoginResponse;

public class SessionManager {
    private static final String PREF_NAME = "EMS";
    private static final String KEY_ACCESS_TOKEN = "accessToken";
    private static final String KEY_REFRESH_TOKEN = "refreshToken";
    private static final String KEY_USER = "user";

    private SharedPreferences prefs;
    private SharedPreferences.Editor editor;
    private Gson gson;

    public SessionManager(Context context) {
        prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
        editor = prefs.edit();
        gson = new Gson();
    }

    /**
     * Save login session after successful login
     */
    public void saveSession(String accessToken, String refreshToken, LoginResponse.User user) {
        editor.putString(KEY_ACCESS_TOKEN, accessToken);
        editor.putString(KEY_REFRESH_TOKEN, refreshToken);
        editor.putString(KEY_USER, gson.toJson(user));
        editor.apply();
    }

    /**
     * Get access token
     */
    public String getAccessToken() {
        return prefs.getString(KEY_ACCESS_TOKEN, null);
    }

    /**
     * Get refresh token
     */
    public String getRefreshToken() {
        return prefs.getString(KEY_REFRESH_TOKEN, null);
    }

    /**
     * Get current user
     */
    public LoginResponse.User getUser() {
        String userJson = prefs.getString(KEY_USER, null);
        if (userJson != null) {
            return gson.fromJson(userJson, LoginResponse.User.class);
        }
        return null;
    }

    /**
     * Check if user is logged in
     */
    public boolean isLoggedIn() {
        return getAccessToken() != null;
    }

    /**
     * Check if user has specific role
     */
    public boolean hasRole(String role) {
        LoginResponse.User user = getUser();
        return user != null && user.getRole().equals(role);
    }

    /**
     * Check if user is admin
     */
    public boolean isAdmin() {
        return hasRole("admin");
    }

    /**
     * Check if user is manager
     */
    public boolean isManager() {
        return hasRole("manager");
    }

    /**
     * Clear session (logout)
     */
    public void clearSession() {
        editor.clear();
        editor.apply();
    }

    /**
     * Update access token (after refresh)
     */
    public void updateAccessToken(String token) {
        editor.putString(KEY_ACCESS_TOKEN, token);
        editor.apply();
    }

    // ==================== BRANCH SESSION MANAGEMENT ====================

    private static final String KEY_SELECTED_BRANCH = "selectedBranch";

    /**
     * Save selected branch for current session
     */
    public void saveSelectedBranch(Branch branch) {
        editor.putString(KEY_SELECTED_BRANCH, gson.toJson(branch));
        editor.apply();
    }

    /**
     * Get selected branch for current session
     */
    public Branch getSelectedBranch() {
        String branchJson = prefs.getString(KEY_SELECTED_BRANCH, null);
        if (branchJson != null) {
            return gson.fromJson(branchJson, Branch.class);
        }
        return null;
    }

    /**
     * Check if branch is selected
     */
    public boolean hasBranchSelected() {
        return getSelectedBranch() != null;
    }

    /**
     * Clear only branch selection (not logout)
     */
    public void clearBranchSelection() {
        editor.remove(KEY_SELECTED_BRANCH);
        editor.apply();
    }
}
```

**Important:** Branch selection is saved in the same session. When user logs out, the branch selection is also cleared automatically via `clearSession()`.

---

## 🔑 Authentication Examples

### LoginActivity.java

```java
package com.yourcompany.ems.activities;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;

import com.yourcompany.ems.R;
import com.yourcompany.ems.api.ApiService;
import com.yourcompany.ems.api.RetrofitClient;
import com.yourcompany.ems.models.LoginRequest;
import com.yourcompany.ems.models.LoginResponse;
import com.yourcompany.ems.utils.SessionManager;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class LoginActivity extends AppCompatActivity {

    private EditText etEmail, etPassword;
    private Button btnLogin;
    private ProgressBar progressBar;
    private TextView tvError;

    private ApiService apiService;
    private SessionManager sessionManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        // Initialize views
        etEmail = findViewById(R.id.etEmail);
        etPassword = findViewById(R.id.etPassword);
        btnLogin = findViewById(R.id.btnLogin);
        progressBar = findViewById(R.id.progressBar);
        tvError = findViewById(R.id.tvError);

        // Initialize API service and session manager
        apiService = RetrofitClient.getInstance(this).getApiService();
        sessionManager = new SessionManager(this);

        // Check if already logged in
        if (sessionManager.isLoggedIn()) {
            goToDashboard();
            return;
        }

        // Set click listener
        btnLogin.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                login();
            }
        });
    }

    private void login() {
        // Get input values
        String email = etEmail.getText().toString().trim();
        String password = etPassword.getText().toString().trim();

        // Validation
        if (email.isEmpty()) {
            etEmail.setError("Email or username is required");
            etEmail.requestFocus();
            return;
        }

        if (password.isEmpty()) {
            etPassword.setError("Password is required");
            etPassword.requestFocus();
            return;
        }

        // Show loading
        setLoading(true);
        tvError.setVisibility(View.GONE);

        // Create request
        LoginRequest request = new LoginRequest(email, password);

        // Make API call
        Call<LoginResponse> call = apiService.login(request);
        call.enqueue(new Callback<LoginResponse>() {
            @Override
            public void onResponse(Call<LoginResponse> call, Response<LoginResponse> response) {
                setLoading(false);

                if (response.isSuccessful() && response.body() != null) {
                    // Login successful
                    LoginResponse loginResponse = response.body();
                    LoginResponse.Data data = loginResponse.getData();

                    // Save session
                    sessionManager.saveSession(
                        data.getAccessToken(),
                        data.getRefreshToken(),
                        data.getUser()
                    );

                    // Show welcome message
                    Toast.makeText(LoginActivity.this,
                        "Welcome, " + data.getUser().getName() + "!",
                        Toast.LENGTH_SHORT).show();

                    // Go to dashboard
                    goToDashboard();

                } else {
                    // Login failed
                    showError("Invalid credentials. Please try again.");
                }
            }

            @Override
            public void onFailure(Call<LoginResponse> call, Throwable t) {
                setLoading(false);
                showError("Network error: " + t.getMessage());
            }
        });
    }

    private void setLoading(boolean isLoading) {
        if (isLoading) {
            progressBar.setVisibility(View.VISIBLE);
            btnLogin.setEnabled(false);
            btnLogin.setText("Logging in...");
        } else {
            progressBar.setVisibility(View.GONE);
            btnLogin.setEnabled(true);
            btnLogin.setText("Login");
        }
    }

    private void showError(String message) {
        tvError.setText(message);
        tvError.setVisibility(View.VISIBLE);
    }

    private void goToDashboard() {
        // Check if user needs to select branch
        SessionManager sm = new SessionManager(this);
        LoginResponse.User user = sm.getUser();

        // Only employees need to select branch
        if (user != null && user.getRole().equals("employee") && !sm.hasBranchSelected()) {
            // Go to branch selection first
            Intent intent = new Intent(LoginActivity.this, BranchSelectionActivity.class);
            startActivity(intent);
            finish();
        } else {
            // Admin/Manager go directly to dashboard
            Intent intent = new Intent(LoginActivity.this, DashboardActivity.class);
            startActivity(intent);
            finish();
        }
    }
}
```

### Layout: res/layout/activity_login.xml

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="24dp"
    android:gravity="center">

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="EMS Login"
        android:textSize="28sp"
        android:textStyle="bold"
        android:layout_marginBottom="32dp"/>

    <TextView
        android:id="@+id/tvError"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:textColor="#F44336"
        android:visibility="gone"
        android:padding="12dp"
        android:background="#FFEBEE"
        android:layout_marginBottom="16dp"/>

    <EditText
        android:id="@+id/etEmail"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:hint="Email or Username"
        android:inputType="textEmailAddress"
        android:padding="16dp"
        android:layout_marginBottom="16dp"/>

    <EditText
        android:id="@+id/etPassword"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:hint="Password"
        android:inputType="textPassword"
        android:padding="16dp"
        android:layout_marginBottom="24dp"/>

    <Button
        android:id="@+id/btnLogin"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="Login"
        android:textSize="16sp"
        android:padding="16dp"/>

    <ProgressBar
        android:id="@+id/progressBar"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:visibility="gone"
        android:layout_marginTop="16dp"/>

</LinearLayout>
```

---

## 🏢 Branch Selection Flow

After login, employees select which branch they'll work at for the current session. This branch selection is used for filtering shifts, attendance, and other data.

### BranchSelectionActivity.java

```java
package com.yourcompany.ems.activities;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.ProgressBar;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.yourcompany.ems.R;
import com.yourcompany.ems.adapters.BranchAdapter;
import com.yourcompany.ems.api.ApiService;
import com.yourcompany.ems.api.RetrofitClient;
import com.yourcompany.ems.models.ApiResponse;
import com.yourcompany.ems.models.Branch;
import com.yourcompany.ems.models.BranchListData;
import com.yourcompany.ems.utils.SessionManager;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class BranchSelectionActivity extends AppCompatActivity implements BranchAdapter.OnBranchClickListener {

    private RecyclerView recyclerView;
    private BranchAdapter adapter;
    private ProgressBar progressBar;
    private List<Branch> branchList;
    private ApiService apiService;
    private SessionManager sessionManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_branch_selection);

        // Initialize views
        recyclerView = findViewById(R.id.recyclerView);
        progressBar = findViewById(R.id.progressBar);

        // Setup RecyclerView
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        branchList = new ArrayList<>();
        adapter = new BranchAdapter(branchList, this);
        recyclerView.setAdapter(adapter);

        // Initialize
        apiService = RetrofitClient.getInstance(this).getApiService();
        sessionManager = new SessionManager(this);

        // Load branches
        loadBranches();
    }

    private void loadBranches() {
        progressBar.setVisibility(View.VISIBLE);

        Call<ApiResponse<BranchListData>> call = apiService.getBranches();
        call.enqueue(new Callback<ApiResponse<BranchListData>>() {
            @Override
            public void onResponse(Call<ApiResponse<BranchListData>> call,
                                 Response<ApiResponse<BranchListData>> response) {
                progressBar.setVisibility(View.GONE);

                if (response.isSuccessful() && response.body() != null) {
                    List<Branch> branches = response.body().getData().getBranches();
                    branchList.clear();
                    branchList.addAll(branches);
                    adapter.notifyDataSetChanged();
                } else {
                    Toast.makeText(BranchSelectionActivity.this,
                        "Failed to load branches",
                        Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<BranchListData>> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                Toast.makeText(BranchSelectionActivity.this,
                    "Network error: " + t.getMessage(),
                    Toast.LENGTH_SHORT).show();
            }
        });
    }

    @Override
    public void onBranchClick(Branch branch) {
        // Save selected branch to session
        sessionManager.saveSelectedBranch(branch);

        Toast.makeText(this, "Selected: " + branch.getName(), Toast.LENGTH_SHORT).show();

        // Go to dashboard
        Intent intent = new Intent(BranchSelectionActivity.this, DashboardActivity.class);
        startActivity(intent);
        finish();
    }

    @Override
    public void onBackPressed() {
        // Don't allow back to login - must select branch
        // If you want to allow logout, add a logout button instead
        Toast.makeText(this, "Please select a branch to continue", Toast.LENGTH_SHORT).show();
    }
}
```

### BranchAdapter.java

```java
package com.yourcompany.ems.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.cardview.widget.CardView;
import androidx.recyclerview.widget.RecyclerView;

import com.yourcompany.ems.R;
import com.yourcompany.ems.models.Branch;

import java.util.List;

public class BranchAdapter extends RecyclerView.Adapter<BranchAdapter.BranchViewHolder> {

    private List<Branch> branches;
    private OnBranchClickListener listener;

    public interface OnBranchClickListener {
        void onBranchClick(Branch branch);
    }

    public BranchAdapter(List<Branch> branches, OnBranchClickListener listener) {
        this.branches = branches;
        this.listener = listener;
    }

    @Override
    public BranchViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
            .inflate(R.layout.item_branch, parent, false);
        return new BranchViewHolder(view);
    }

    @Override
    public void onBindViewHolder(BranchViewHolder holder, int position) {
        Branch branch = branches.get(position);

        holder.tvName.setText(branch.getName());
        holder.tvAddress.setText(branch.getAddress());

        if (branch.getLocation() != null) {
            holder.tvRadius.setText("Check-in radius: " + branch.getLocation().getRadius() + "m");
        }

        holder.cardView.setOnClickListener(v -> listener.onBranchClick(branch));
    }

    @Override
    public int getItemCount() {
        return branches.size();
    }

    static class BranchViewHolder extends RecyclerView.ViewHolder {
        CardView cardView;
        TextView tvName, tvAddress, tvRadius;

        BranchViewHolder(View itemView) {
            super(itemView);
            cardView = itemView.findViewById(R.id.cardView);
            tvName = itemView.findViewById(R.id.tvName);
            tvAddress = itemView.findViewById(R.id.tvAddress);
            tvRadius = itemView.findViewById(R.id.tvRadius);
        }
    }
}
```

### Layout: res/layout/activity_branch_selection.xml

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="16dp">

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Select Your Branch"
        android:textSize="24sp"
        android:textStyle="bold"
        android:layout_marginBottom="8dp"/>

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Choose the branch where you'll be working today"
        android:textSize="14sp"
        android:textColor="#666666"
        android:layout_marginBottom="24dp"/>

    <ProgressBar
        android:id="@+id/progressBar"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_gravity="center"
        android:visibility="gone"/>

    <androidx.recyclerview.widget.RecyclerView
        android:id="@+id/recyclerView"
        android:layout_width="match_parent"
        android:layout_height="match_parent"/>

</LinearLayout>
```

### Layout: res/layout/item_branch.xml

```xml
<?xml version="1.0" encoding="utf-8"?>
<androidx.cardview.widget.CardView xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:id="@+id/cardView"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:layout_margin="8dp"
    app:cardCornerRadius="8dp"
    app:cardElevation="4dp"
    android:clickable="true"
    android:focusable="true"
    android:foreground="?android:attr/selectableItemBackground">

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="vertical"
        android:padding="16dp">

        <TextView
            android:id="@+id/tvName"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="Branch Name"
            android:textSize="18sp"
            android:textStyle="bold"
            android:textColor="#000000"/>

        <TextView
            android:id="@+id/tvAddress"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="Branch Address"
            android:textSize="14sp"
            android:textColor="#666666"
            android:layout_marginTop="4dp"/>

        <TextView
            android:id="@+id/tvRadius"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="Check-in radius: 500m"
            android:textSize="12sp"
            android:textColor="#999999"
            android:layout_marginTop="4dp"/>

    </LinearLayout>

</androidx.cardview.widget.CardView>
```

### Using Selected Branch in Your App

Once a branch is selected, use it throughout the app:

```java
// In any Activity
SessionManager sessionManager = new SessionManager(this);
Branch selectedBranch = sessionManager.getSelectedBranch();

if (selectedBranch != null) {
    // Filter shifts by branch
    apiService.getShiftsByBranch(selectedBranch.getId());

    // Display branch name in toolbar
    getSupportActionBar().setSubtitle(selectedBranch.getName());

    // Filter attendance by branch
    // etc.
}
```

### Allowing Branch Re-selection

Add a "Change Branch" button in your Dashboard or Settings:

```java
// In DashboardActivity or SettingsActivity
Button btnChangeBranch = findViewById(R.id.btnChangeBranch);
btnChangeBranch.setOnClickListener(v -> {
    // Clear current branch selection
    sessionManager.clearBranchSelection();

    // Go back to branch selection
    Intent intent = new Intent(this, BranchSelectionActivity.class);
    startActivity(intent);
    finish();
});
```

### Important Notes

✅ **No Backend Changes Required** - Uses existing API endpoints
✅ **Session-Based** - Branch selection persists until logout
✅ **GPS Validation Still Works** - Backend validates location regardless of selection
✅ **Flexible** - Employee can change branch anytime
✅ **Role-Based** - Only employees need to select branch (admin/manager skip this)

---

## 📅 Calendar View - Shift by Date

Employee chọn ngày → Hiển thị các ca làm việc đã được approved cho ngày đó

### ShiftCalendarActivity.java

```java
package com.yourcompany.ems.activities;

import android.os.Bundle;
import android.widget.CalendarView;
import android.widget.ProgressBar;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.yourcompany.ems.R;
import com.yourcompany.ems.adapters.ShiftRegistrationAdapter;
import com.yourcompany.ems.api.ApiService;
import com.yourcompany.ems.api.RetrofitClient;
import com.yourcompany.ems.models.ApiResponse;
import com.yourcompany.ems.models.ShiftRegistration;
import com.yourcompany.ems.models.ShiftRegistrationListData;
import com.yourcompany.ems.utils.SessionManager;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ShiftCalendarActivity extends AppCompatActivity implements ShiftRegistrationAdapter.OnShiftClickListener {

    private CalendarView calendarView;
    private RecyclerView recyclerView;
    private ProgressBar progressBar;
    private ShiftRegistrationAdapter adapter;
    private List<ShiftRegistration> shiftList;
    private ApiService apiService;
    private SessionManager sessionManager;
    private String selectedDate;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_shift_calendar);

        // Initialize views
        calendarView = findViewById(R.id.calendarView);
        recyclerView = findViewById(R.id.recyclerView);
        progressBar = findViewById(R.id.progressBar);

        // Setup RecyclerView
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        shiftList = new ArrayList<>();
        adapter = new ShiftRegistrationAdapter(shiftList, this);
        recyclerView.setAdapter(adapter);

        // Initialize
        apiService = RetrofitClient.getInstance(this).getApiService();
        sessionManager = new SessionManager(this);

        // Set today as default
        selectedDate = formatDate(new Date());
        loadShiftsForDate(selectedDate);

        // Listen for date selection
        calendarView.setOnDateChangeListener((view, year, month, dayOfMonth) -> {
            // Format date as YYYY-MM-DD
            selectedDate = String.format(Locale.US, "%04d-%02d-%02d", year, month + 1, dayOfMonth);
            loadShiftsForDate(selectedDate);
        });
    }

    private void loadShiftsForDate(String date) {
        progressBar.setVisibility(View.VISIBLE);

        // Get approved shift registrations for selected date
        Call<ApiResponse<ShiftRegistrationListData>> call = apiService.getShiftRegistrations(
            1,
            50,
            "approved", // Only approved shifts
            date,       // Selected date
            sessionManager.getUser().getId() // Current employee
        );

        call.enqueue(new Callback<ApiResponse<ShiftRegistrationListData>>() {
            @Override
            public void onResponse(Call<ApiResponse<ShiftRegistrationListData>> call,
                                 Response<ApiResponse<ShiftRegistrationListData>> response) {
                progressBar.setVisibility(View.GONE);

                if (response.isSuccessful() && response.body() != null) {
                    List<ShiftRegistration> registrations = response.body().getData().getRegistrations();

                    shiftList.clear();
                    shiftList.addAll(registrations);
                    adapter.notifyDataSetChanged();

                    if (shiftList.isEmpty()) {
                        Toast.makeText(ShiftCalendarActivity.this,
                            "No approved shifts for " + date,
                            Toast.LENGTH_SHORT).show();
                    }
                } else {
                    Toast.makeText(ShiftCalendarActivity.this,
                        "Failed to load shifts",
                        Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<ShiftRegistrationListData>> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                Toast.makeText(ShiftCalendarActivity.this,
                    "Network error: " + t.getMessage(),
                    Toast.LENGTH_SHORT).show();
            }
        });
    }

    private String formatDate(Date date) {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd", Locale.US);
        return sdf.format(date);
    }

    @Override
    public void onShiftClick(ShiftRegistration registration) {
        // Navigate to attendance/check-in screen with this registration
        Toast.makeText(this,
            "Selected: " + registration.getShift().getShiftName() +
            " (" + registration.getShift().getStartTime() + " - " +
            registration.getShift().getEndTime() + ")",
            Toast.LENGTH_SHORT).show();

        // TODO: Go to check-in activity with registrationId
        // Intent intent = new Intent(this, CheckInActivity.class);
        // intent.putExtra("registrationId", registration.getId());
        // startActivity(intent);
    }
}
```

### ShiftRegistrationAdapter.java

```java
package com.yourcompany.ems.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.cardview.widget.CardView;
import androidx.recyclerview.widget.RecyclerView;

import com.yourcompany.ems.R;
import com.yourcompany.ems.models.ShiftRegistration;

import java.util.List;

public class ShiftRegistrationAdapter extends RecyclerView.Adapter<ShiftRegistrationAdapter.ViewHolder> {

    private List<ShiftRegistration> registrations;
    private OnShiftClickListener listener;

    public interface OnShiftClickListener {
        void onShiftClick(ShiftRegistration registration);
    }

    public ShiftRegistrationAdapter(List<ShiftRegistration> registrations, OnShiftClickListener listener) {
        this.registrations = registrations;
        this.listener = listener;
    }

    @Override
    public ViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
            .inflate(R.layout.item_shift_registration, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(ViewHolder holder, int position) {
        ShiftRegistration registration = registrations.get(position);

        if (registration.getShift() != null) {
            holder.tvShiftName.setText(registration.getShift().getShiftName());
            holder.tvTime.setText(registration.getShift().getStartTime() + " - " +
                                 registration.getShift().getEndTime());
        }

        holder.tvDate.setText(registration.getDate());
        holder.tvStatus.setText(registration.getStatus().toUpperCase());

        // Color based on status
        int color;
        switch (registration.getStatus()) {
            case "approved":
                color = 0xFF4CAF50; // Green
                break;
            case "pending":
                color = 0xFFFFC107; // Yellow
                break;
            case "rejected":
                color = 0xFFF44336; // Red
                break;
            default:
                color = 0xFF9E9E9E; // Gray
        }
        holder.tvStatus.setTextColor(color);

        holder.cardView.setOnClickListener(v -> listener.onShiftClick(registration));
    }

    @Override
    public int getItemCount() {
        return registrations.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        CardView cardView;
        TextView tvShiftName, tvTime, tvDate, tvStatus;

        ViewHolder(View itemView) {
            super(itemView);
            cardView = itemView.findViewById(R.id.cardView);
            tvShiftName = itemView.findViewById(R.id.tvShiftName);
            tvTime = itemView.findViewById(R.id.tvTime);
            tvDate = itemView.findViewById(R.id.tvDate);
            tvStatus = itemView.findViewById(R.id.tvStatus);
        }
    }
}
```

### Layout: res/layout/activity_shift_calendar.xml

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical">

    <CalendarView
        android:id="@+id/calendarView"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"/>

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Your Shifts"
        android:textSize="18sp"
        android:textStyle="bold"
        android:padding="16dp"/>

    <ProgressBar
        android:id="@+id/progressBar"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_gravity="center"
        android:visibility="gone"/>

    <androidx.recyclerview.widget.RecyclerView
        android:id="@+id/recyclerView"
        android:layout_width="match_parent"
        android:layout_height="0dp"
        android:layout_weight="1"
        android:padding="8dp"/>

</LinearLayout>
```

### Layout: res/layout/item_shift_registration.xml

```xml
<?xml version="1.0" encoding="utf-8"?>
<androidx.cardview.widget.CardView xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:id="@+id/cardView"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:layout_margin="8dp"
    app:cardCornerRadius="8dp"
    app:cardElevation="4dp">

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="vertical"
        android:padding="16dp">

        <TextView
            android:id="@+id/tvShiftName"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="Morning Shift"
            android:textSize="18sp"
            android:textStyle="bold"/>

        <TextView
            android:id="@+id/tvTime"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="08:00 - 16:00"
            android:textSize="14sp"
            android:textColor="#666666"
            android:layout_marginTop="4dp"/>

        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:orientation="horizontal"
            android:layout_marginTop="8dp">

            <TextView
                android:id="@+id/tvDate"
                android:layout_width="0dp"
                android:layout_height="wrap_content"
                android:layout_weight="1"
                android:text="2025-11-09"
                android:textSize="12sp"/>

            <TextView
                android:id="@+id/tvStatus"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="APPROVED"
                android:textSize="12sp"
                android:textStyle="bold"/>

        </LinearLayout>

    </LinearLayout>

</androidx.cardview.widget.CardView>
```

### How to Use

**1. In Dashboard, add button to view calendar:**

```java
Button btnViewCalendar = findViewById(R.id.btnViewCalendar);
btnViewCalendar.setOnClickListener(v -> {
    Intent intent = new Intent(DashboardActivity.this, ShiftCalendarActivity.class);
    startActivity(intent);
});
```

**2. Employee flow:**
```
Select Branch → View Calendar → Pick Date → See Approved Shifts → Select Shift → Check-in
```

**3. The backend query:**
```
GET /api/v1/shift-registrations?date=2025-11-09&status=approved&employeeId=xxx
```

Returns all approved shift registrations for that employee on that date.

---## 📊 Feature Examples

### Example 1: Employee List Activity

**EmployeeListActivity.java**

```java
package com.yourcompany.ems.activities;

import android.os.Bundle;
import android.view.View;
import android.widget.ProgressBar;
import android.widget.Toast;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.yourcompany.ems.R;
import com.yourcompany.ems.adapters.EmployeeAdapter;
import com.yourcompany.ems.api.ApiService;
import com.yourcompany.ems.api.RetrofitClient;
import com.yourcompany.ems.models.ApiResponse;
import com.yourcompany.ems.models.Employee;
import com.yourcompany.ems.models.EmployeeListData;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class EmployeeListActivity extends AppCompatActivity implements EmployeeAdapter.OnEmployeeClickListener {

    private RecyclerView recyclerView;
    private EmployeeAdapter adapter;
    private ProgressBar progressBar;
    private List<Employee> employeeList;
    private ApiService apiService;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_employee_list);

        // Initialize views
        recyclerView = findViewById(R.id.recyclerView);
        progressBar = findViewById(R.id.progressBar);

        // Setup RecyclerView
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        employeeList = new ArrayList<>();
        adapter = new EmployeeAdapter(employeeList, this);
        recyclerView.setAdapter(adapter);

        // Initialize API service
        apiService = RetrofitClient.getInstance(this).getApiService();

        // Load employees
        loadEmployees();
    }

    private void loadEmployees() {
        progressBar.setVisibility(View.VISIBLE);

        // Make API call
        Call<ApiResponse<EmployeeListData>> call = apiService.getEmployees(1, 50, null);

        call.enqueue(new Callback<ApiResponse<EmployeeListData>>() {
            @Override
            public void onResponse(Call<ApiResponse<EmployeeListData>> call,
                                 Response<ApiResponse<EmployeeListData>> response) {
                progressBar.setVisibility(View.GONE);

                if (response.isSuccessful() && response.body() != null) {
                    EmployeeListData data = response.body().getData();

                    employeeList.clear();
                    employeeList.addAll(data.getEmployees());
                    adapter.notifyDataSetChanged();

                    Toast.makeText(EmployeeListActivity.this,
                        "Loaded " + employeeList.size() + " employees",
                        Toast.LENGTH_SHORT).show();
                } else {
                    Toast.makeText(EmployeeListActivity.this,
                        "Failed to load employees",
                        Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<EmployeeListData>> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                Toast.makeText(EmployeeListActivity.this,
                    "Network error: " + t.getMessage(),
                    Toast.LENGTH_SHORT).show();
            }
        });
    }

    @Override
    public void onEmployeeClick(Employee employee) {
        // Handle employee click - show details
        Toast.makeText(this, "Clicked: " + employee.getName(), Toast.LENGTH_SHORT).show();
    }

    @Override
    public void onEmployeeDelete(Employee employee) {
        // Show confirmation dialog
        new AlertDialog.Builder(this)
            .setTitle("Delete Employee")
            .setMessage("Are you sure you want to delete " + employee.getName() + "?")
            .setPositiveButton("Delete", (dialog, which) -> deleteEmployee(employee))
            .setNegativeButton("Cancel", null)
            .show();
    }

    private void deleteEmployee(Employee employee) {
        Call<ApiResponse<Void>> call = apiService.deleteEmployee(employee.getId());

        call.enqueue(new Callback<ApiResponse<Void>>() {
            @Override
            public void onResponse(Call<ApiResponse<Void>> call, Response<ApiResponse<Void>> response) {
                if (response.isSuccessful()) {
                    Toast.makeText(EmployeeListActivity.this,
                        "Employee deleted successfully",
                        Toast.LENGTH_SHORT).show();
                    loadEmployees(); // Refresh list
                } else {
                    Toast.makeText(EmployeeListActivity.this,
                        "Failed to delete employee",
                        Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Void>> call, Throwable t) {
                Toast.makeText(EmployeeListActivity.this,
                    "Error: " + t.getMessage(),
                    Toast.LENGTH_SHORT).show();
            }
        });
    }
}
```

**EmployeeAdapter.java**

```java
package com.yourcompany.ems.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;
import androidx.recyclerview.widget.RecyclerView;

import com.yourcompany.ems.R;
import com.yourcompany.ems.models.Employee;

import java.util.List;

public class EmployeeAdapter extends RecyclerView.Adapter<EmployeeAdapter.EmployeeViewHolder> {

    private List<Employee> employees;
    private OnEmployeeClickListener listener;

    public interface OnEmployeeClickListener {
        void onEmployeeClick(Employee employee);
        void onEmployeeDelete(Employee employee);
    }

    public EmployeeAdapter(List<Employee> employees, OnEmployeeClickListener listener) {
        this.employees = employees;
        this.listener = listener;
    }

    @Override
    public EmployeeViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
            .inflate(R.layout.item_employee, parent, false);
        return new EmployeeViewHolder(view);
    }

    @Override
    public void onBindViewHolder(EmployeeViewHolder holder, int position) {
        Employee employee = employees.get(position);

        holder.tvName.setText(employee.getName());
        holder.tvEmail.setText(employee.getEmail() != null ? employee.getEmail() : "No email");
        holder.tvRole.setText(employee.getRole().toUpperCase());

        holder.itemView.setOnClickListener(v -> listener.onEmployeeClick(employee));
        holder.btnDelete.setOnClickListener(v -> listener.onEmployeeDelete(employee));
    }

    @Override
    public int getItemCount() {
        return employees.size();
    }

    static class EmployeeViewHolder extends RecyclerView.ViewHolder {
        TextView tvName, tvEmail, tvRole;
        Button btnDelete;

        EmployeeViewHolder(View itemView) {
            super(itemView);
            tvName = itemView.findViewById(R.id.tvName);
            tvEmail = itemView.findViewById(R.id.tvEmail);
            tvRole = itemView.findViewById(R.id.tvRole);
            btnDelete = itemView.findViewById(R.id.btnDelete);
        }
    }
}
```

### Example 2: Check-In Activity with GPS

**AttendanceActivity.java**

```java
package com.yourcompany.ems.activities;

import android.Manifest;
import android.content.pm.PackageManager;
import android.location.Location;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;

import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.tasks.OnSuccessListener;
import com.yourcompany.ems.R;
import com.yourcompany.ems.api.ApiService;
import com.yourcompany.ems.api.RetrofitClient;
import com.yourcompany.ems.models.ApiResponse;
import com.yourcompany.ems.models.Attendance;
import com.yourcompany.ems.models.CheckInRequest;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class AttendanceActivity extends AppCompatActivity {

    private static final int LOCATION_PERMISSION_CODE = 100;

    private Button btnCheckIn, btnCheckOut;
    private TextView tvStatus;
    private FusedLocationProviderClient fusedLocationClient;
    private ApiService apiService;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_attendance);

        // Initialize views
        btnCheckIn = findViewById(R.id.btnCheckIn);
        btnCheckOut = findViewById(R.id.btnCheckOut);
        tvStatus = findViewById(R.id.tvStatus);

        // Initialize location client
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this);

        // Initialize API service
        apiService = RetrofitClient.getInstance(this).getApiService();

        // Set click listeners
        btnCheckIn.setOnClickListener(v -> checkIn());
        btnCheckOut.setOnClickListener(v -> checkOut());

        // Request location permission
        checkLocationPermission();
    }

    private void checkLocationPermission() {
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
            != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this,
                new String[]{Manifest.permission.ACCESS_FINE_LOCATION},
                LOCATION_PERMISSION_CODE);
        }
    }

    private void checkIn() {
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
            != PackageManager.PERMISSION_GRANTED) {
            Toast.makeText(this, "Location permission required", Toast.LENGTH_SHORT).show();
            checkLocationPermission();
            return;
        }

        // Show loading
        btnCheckIn.setEnabled(false);
        tvStatus.setText("Getting location...");

        // Get current location
        fusedLocationClient.getLastLocation()
            .addOnSuccessListener(this, new OnSuccessListener<Location>() {
                @Override
                public void onSuccess(Location location) {
                    if (location != null) {
                        // Create check-in request
                        CheckInRequest request = new CheckInRequest(
                            location.getLatitude(),
                            location.getLongitude()
                        );

                        // Make API call
                        Call<ApiResponse<Attendance>> call = apiService.checkIn(request);
                        call.enqueue(new Callback<ApiResponse<Attendance>>() {
                            @Override
                            public void onResponse(Call<ApiResponse<Attendance>> call,
                                                 Response<ApiResponse<Attendance>> response) {
                                btnCheckIn.setEnabled(true);

                                if (response.isSuccessful() && response.body() != null) {
                                    tvStatus.setText("✅ " + response.body().getMessage());
                                    Toast.makeText(AttendanceActivity.this,
                                        "Check-in successful!",
                                        Toast.LENGTH_SHORT).show();
                                } else {
                                    tvStatus.setText("❌ Check-in failed");
                                    Toast.makeText(AttendanceActivity.this,
                                        "Check-in failed. Please try again.",
                                        Toast.LENGTH_SHORT).show();
                                }
                            }

                            @Override
                            public void onFailure(Call<ApiResponse<Attendance>> call, Throwable t) {
                                btnCheckIn.setEnabled(true);
                                tvStatus.setText("❌ Network error");
                                Toast.makeText(AttendanceActivity.this,
                                    "Error: " + t.getMessage(),
                                    Toast.LENGTH_SHORT).show();
                            }
                        });
                    } else {
                        btnCheckIn.setEnabled(true);
                        tvStatus.setText("Unable to get location");
                        Toast.makeText(AttendanceActivity.this,
                            "Unable to get location. Please try again.",
                            Toast.LENGTH_SHORT).show();
                    }
                }
            })
            .addOnFailureListener(e -> {
                btnCheckIn.setEnabled(true);
                tvStatus.setText("Location error");
                Toast.makeText(AttendanceActivity.this,
                    "Location error: " + e.getMessage(),
                    Toast.LENGTH_SHORT).show();
            });
    }

    private void checkOut() {
        // Similar implementation to checkIn but call apiService.checkOut()
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
            != PackageManager.PERMISSION_GRANTED) {
            Toast.makeText(this, "Location permission required", Toast.LENGTH_SHORT).show();
            return;
        }

        btnCheckOut.setEnabled(false);
        tvStatus.setText("Getting location...");

        fusedLocationClient.getLastLocation()
            .addOnSuccessListener(this, location -> {
                if (location != null) {
                    CheckInRequest request = new CheckInRequest(
                        location.getLatitude(),
                        location.getLongitude()
                    );

                    Call<ApiResponse<Attendance>> call = apiService.checkOut(request);
                    call.enqueue(new Callback<ApiResponse<Attendance>>() {
                        @Override
                        public void onResponse(Call<ApiResponse<Attendance>> call,
                                             Response<ApiResponse<Attendance>> response) {
                            btnCheckOut.setEnabled(true);

                            if (response.isSuccessful() && response.body() != null) {
                                tvStatus.setText("✅ " + response.body().getMessage());
                                Toast.makeText(AttendanceActivity.this,
                                    "Check-out successful!",
                                    Toast.LENGTH_SHORT).show();
                            } else {
                                tvStatus.setText("❌ Check-out failed");
                            }
                        }

                        @Override
                        public void onFailure(Call<ApiResponse<Attendance>> call, Throwable t) {
                            btnCheckOut.setEnabled(true);
                            tvStatus.setText("❌ Network error");
                        }
                    });
                }
            });
    }
}
```

---

## 🔄 Real-time with Socket.IO

**SocketManager.java**

```java
package com.yourcompany.ems.utils;

import android.content.Context;
import android.util.Log;
import io.socket.client.IO;
import io.socket.client.Socket;
import io.socket.emitter.Emitter;
import org.json.JSONException;
import org.json.JSONObject;

import java.net.URISyntaxException;

public class SocketManager {
    private static final String TAG = "SocketManager";
    private static final String SOCKET_URL = "https://emsbackend-enh5aahkg4dcfkfs.southeastasia-01.azurewebsites.net";
    // For local development: "http://10.0.2.2:5000" (emulator) or "http://YOUR_PC_IP:5000" (device)

    private static SocketManager instance;
    private Socket socket;
    private Context context;
    private NotificationListener notificationListener;
    private MessageListener messageListener;

    public interface NotificationListener {
        void onNotificationReceived(String title, String message);
    }

    public interface MessageListener {
        void onMessageReceived(String senderId, String content);
    }

    private SocketManager(Context context) {
        this.context = context.getApplicationContext();
    }

    public static synchronized SocketManager getInstance(Context context) {
        if (instance == null) {
            instance = new SocketManager(context);
        }
        return instance;
    }

    /**
     * Connect to Socket.IO server
     */
    public void connect(String token) {
        try {
            IO.Options options = new IO.Options();
            options.auth = new java.util.HashMap<String, String>() {{
                put("token", token);
            }};

            socket = IO.socket(SOCKET_URL, options);

            // Connection listeners
            socket.on(Socket.EVENT_CONNECT, new Emitter.Listener() {
                @Override
                public void call(Object... args) {
                    Log.d(TAG, "Socket connected!");
                }
            });

            socket.on(Socket.EVENT_DISCONNECT, new Emitter.Listener() {
                @Override
                public void call(Object... args) {
                    Log.d(TAG, "Socket disconnected!");
                }
            });

            socket.on(Socket.EVENT_CONNECT_ERROR, new Emitter.Listener() {
                @Override
                public void call(Object... args) {
                    Log.e(TAG, "Socket connection error: " + args[0]);
                }
            });

            // Listen for notifications
            socket.on("notification", new Emitter.Listener() {
                @Override
                public void call(Object... args) {
                    try {
                        JSONObject data = (JSONObject) args[0];
                        String title = data.getString("title");
                        String message = data.getString("message");

                        Log.d(TAG, "Notification received: " + title);

                        if (notificationListener != null) {
                            notificationListener.onNotificationReceived(title, message);
                        }
                    } catch (JSONException e) {
                        Log.e(TAG, "Error parsing notification", e);
                    }
                }
            });

            // Listen for messages
            socket.on("message", new Emitter.Listener() {
                @Override
                public void call(Object... args) {
                    try {
                        JSONObject data = (JSONObject) args[0];
                        String senderId = data.getString("senderId");
                        String content = data.getString("content");

                        Log.d(TAG, "Message received from: " + senderId);

                        if (messageListener != null) {
                            messageListener.onMessageReceived(senderId, content);
                        }
                    } catch (JSONException e) {
                        Log.e(TAG, "Error parsing message", e);
                    }
                }
            });

            // Connect
            socket.connect();

        } catch (URISyntaxException e) {
            Log.e(TAG, "Socket URI error", e);
        }
    }

    /**
     * Disconnect from Socket.IO server
     */
    public void disconnect() {
        if (socket != null) {
            socket.disconnect();
            socket.off();
            socket = null;
        }
    }

    /**
     * Send message to another user
     */
    public void sendMessage(String receiverId, String content) {
        if (socket != null && socket.connected()) {
            try {
                JSONObject data = new JSONObject();
                data.put("receiverId", receiverId);
                data.put("content", content);
                socket.emit("send-message", data);
            } catch (JSONException e) {
                Log.e(TAG, "Error sending message", e);
            }
        }
    }

    /**
     * Join a chat room
     */
    public void joinRoom(String conversationId) {
        if (socket != null && socket.connected()) {
            try {
                JSONObject data = new JSONObject();
                data.put("conversationId", conversationId);
                socket.emit("join-room", data);
            } catch (JSONException e) {
                Log.e(TAG, "Error joining room", e);
            }
        }
    }

    /**
     * Leave a chat room
     */
    public void leaveRoom(String conversationId) {
        if (socket != null && socket.connected()) {
            try {
                JSONObject data = new JSONObject();
                data.put("conversationId", conversationId);
                socket.emit("leave-room", data);
            } catch (JSONException e) {
                Log.e(TAG, "Error leaving room", e);
            }
        }
    }

    /**
     * Send typing indicator
     */
    public void sendTyping(String conversationId) {
        if (socket != null && socket.connected()) {
            try {
                JSONObject data = new JSONObject();
                data.put("conversationId", conversationId);
                socket.emit("typing", data);
            } catch (JSONException e) {
                Log.e(TAG, "Error sending typing", e);
            }
        }
    }

    // Setters for listeners
    public void setNotificationListener(NotificationListener listener) {
        this.notificationListener = listener;
    }

    public void setMessageListener(MessageListener listener) {
        this.messageListener = listener;
    }
}
```

---

## 🔧 Application Class

**EMSApplication.java**

```java
package com.yourcompany.ems;

import android.app.Application;
import com.yourcompany.ems.api.RetrofitClient;
import com.yourcompany.ems.utils.SessionManager;
import com.yourcompany.ems.utils.SocketManager;

public class EMSApplication extends Application {

    @Override
    public void onCreate() {
        super.onCreate();

        // Initialize Retrofit
        RetrofitClient.getInstance(this);

        // Initialize Socket.IO if user is logged in
        SessionManager sessionManager = new SessionManager(this);
        if (sessionManager.isLoggedIn()) {
            String token = sessionManager.getAccessToken();
            SocketManager.getInstance(this).connect(token);
        }
    }
}
```

Don't forget to add this to your `AndroidManifest.xml`:

```xml
<application
    android:name=".EMSApplication"
    ...>
```

---

## 🧪 Testing & Troubleshooting

### Test Credentials (Production Ready!)

The production database has been seeded with test accounts. You can use these credentials immediately:

```
Admin Account:
  Username: admin
  Email: admin@ems.com
  Password: Admin@123

Manager Account:
  Username: michael.manager
  Email: michael.manager@ems.com
  Password: Manager@123

Employee Account:
  Username: alice.johnson
  Email: alice.johnson@ems.com
  Password: Employee@123
```

**✅ These credentials are already working on the production server!**

### Common Issues

#### 1. "Unable to connect to server"

- **Check internet connection:** Ensure device/emulator has internet access
- **Check URL:** Production uses `https://emsbackend-enh5aahkg4dcfkfs.southeastasia-01.azurewebsites.net/api/v1/`
- **For local development:** Emulator uses `10.0.2.2`, physical device needs PC's IP
- **Check network security config:** HTTP must be allowed for local development only

#### 2. "401 Unauthorized"

- Token expired or invalid
- User not logged in
- Check SessionManager has saved token correctly

#### 3. "Network Security Exception"

- Add network security config XML (see setup section)
- Ensure `cleartextTrafficPermitted="true"` for development

#### 4. "Location permission denied"

- Request permission at runtime
- Check manifest has location permissions

### Debugging Tips

**View API requests in Logcat:**

```
adb logcat | grep "OkHttp"
```

**Check if token is saved:**

```java
SessionManager sessionManager = new SessionManager(context);
Log.d("Token", "Access token: " + sessionManager.getAccessToken());
```

**Test API with Postman first:**

- Use emulator URL: `http://10.0.2.2:5000/api/v1`
- Test login and get token
- Use token in other requests

### Finding Your PC's IP Address

**Windows:**

```
ipconfig
```

Look for "IPv4 Address" (e.g., 192.168.1.100)

**Mac/Linux:**

```
ifconfig
```

Look for "inet" address

---

## 🎉 Quick Start Checklist

1. ✅ Add dependencies to `build.gradle`
2. ✅ Add permissions to `AndroidManifest.xml`
3. ✅ Create network security config
4. ✅ Copy all model classes
5. ✅ Create ApiService interface
6. ✅ Create RetrofitClient
7. ✅ Create SessionManager (with branch management)
8. ✅ Create LoginActivity
9. ✅ Create BranchSelectionActivity
10. ✅ Create BranchAdapter
11. ✅ Test login with seed credentials
12. ✅ Test branch selection flow
13. ✅ Build other features!

## 🔄 Employee Flow Summary

```
Login → Branch Selection → Dashboard → View Shifts (filtered by branch) → Register for Shift → Check-in with GPS → Work → Check-out → Logout (clears branch)
```

**Key Points:**

- Employee selects branch after login
- Branch selection persists for the entire session
- All shifts, attendance, and data are filtered by selected branch
- Employee can change branch anytime via "Change Branch" button
- Logout clears branch selection (requires re-selection on next login)
- GPS validation happens on backend (independent of selection)

---

## 📖 All API Endpoints Quick Reference

| Category          | Endpoint                    | Method | Auth | Description       |
| ----------------- | --------------------------- | ------ | ---- | ----------------- |
| **Auth**          | `/auth/login`               | POST   | ❌   | Login             |
|                   | `/auth/logout`              | POST   | ✅   | Logout            |
|                   | `/auth/refresh-token`       | POST   | ❌   | Refresh token     |
|                   | `/auth/update-email`        | PUT    | ✅   | Add/update email  |
|                   | `/auth/verify-email`        | POST   | ❌   | Verify email      |
| **Employees**     | `/employees`                | GET    | ✅   | Get all employees |
|                   | `/employees`                | POST   | ✅   | Create employee   |
|                   | `/employees/{id}`           | GET    | ✅   | Get by ID         |
|                   | `/employees/{id}`           | PUT    | ✅   | Update            |
|                   | `/employees/{id}`           | DELETE | ✅   | Delete            |
| **Attendance**    | `/attendance/check-in`      | POST   | ✅   | Check in          |
|                   | `/attendance/check-out`     | POST   | ✅   | Check out         |
|                   | `/attendance/employee/{id}` | GET    | ✅   | Get attendance    |
| **Notifications** | `/notifications`            | GET    | ✅   | Get notifications |
|                   | `/notifications/{id}`       | PUT    | ✅   | Mark as read      |
| **Messages**      | `/messages`                 | GET    | ✅   | Get conversations |
|                   | `/messages`                 | POST   | ✅   | Send message      |
| **Branches**      | `/branches`                 | GET    | ✅   | Get all branches  |
| **Shifts**        | `/shifts`                   | GET    | ✅   | Get all shifts    |
| **Payroll**       | `/payroll/employee/{id}`    | GET    | ✅   | Get payrolls      |
| **Violations**    | `/violations/employee/{id}` | GET    | ✅   | Get violations    |

---

## 🚀 You're Ready!

You now have everything you need to build a complete Android app for the EMS system!

**Next Steps:**

1. Start with LoginActivity
2. Build DashboardActivity with navigation
3. Add feature activities one by one
4. Test with seed data
5. Add real-time features with Socket.IO

Good luck with your Android development! 🎉

---

**Need help?** Check the troubleshooting section or test with Postman first!
