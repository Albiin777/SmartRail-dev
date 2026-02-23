# SmartRail API Documentation

Welcome to the SmartRail API documentation. This API provides comprehensive data for train searches, schedules, seat layouts, fares, and ticket booking.

**Base URL:** `http://localhost:3000`

---

## 🚀 Getting Started

1.  Navigate to the `SmartRail-api` directory.
2.  Install dependencies (first time only):
    ```bash
    npm install
    ```
3.  Start the server:
    ```bash
    node server.js
    ```
    OR (for development with auto-restart):
    ```bash
    npm run dev
    ```

---

## 🚆 Train Information Endpoints

### 1. Search Train
Search for a train by its number or name.

*   **Endpoint:** `GET /api/trains/search`
*   **Query Parameters:**
    *   `q`: (Required) Train number or name (e.g., "12076", "Jan Shatabdi").
*   **Example:** `GET /api/trains/search?q=12076`

### 2. Search Trains Between Stations
Find trains running between two specific stations.

*   **Endpoint:** `GET /api/trains/between-stations`
*   **Query Parameters:**
    *   `source`: (Required) Source station code (e.g., "TVC").
    *   `destination`: (Required) Destination station code (e.g., "CLT").
*   **Example:** `GET /api/trains/between-stations?source=TVC&destination=CLT`

### 3. Get Full Train Details
Retrieve complete details for a specific train, including its type, run days, and full schedule.

*   **Endpoint:** `GET /api/trains/:trainNumber`
*   **Example:** `GET /api/trains/12076`

### 4. Get Train Schedule
Get only the schedule (list of stops) for a train.

*   **Endpoint:** `GET /api/trains/:trainNumber/schedule`
*   **Example:** `GET /api/trains/12076/schedule`

### 5. Get Train Seat Layout
Fetch the exact seat map for a train, including coach composition and individual seat/berth types.

*   **Endpoint:** `GET /api/trains/:trainNumber/seat-layout`
*   **Example:** `GET /api/trains/12076/seat-layout`

---

## 🚉 Station Information Endpoints

### 6. Search Stations
Search for stations by name or code. Use this for autocomplete dropdowns.

*   **Endpoint:** `GET /api/stations/search`
*   **Query Parameters:**
    *   `q`: (Required) Search term (min 2 chars).
*   **Example:** `GET /api/stations/search?q=trivandrum`

### 7. Get Station Details
Get canonical details (code, name) for a specific station.

*   **Endpoint:** `GET /api/stations/:stationCode`
*   **Example:** `GET /api/stations/TVC`

### 8. Get Station Schedule (Live Board)
See all trains arriving at or departing from a station.

*   **Endpoint:** `GET /api/stations/:stationCode/schedule`
*   **Example:** `GET /api/stations/TVC/schedule`

---

## 🎫 Booking & Commerce Endpoints

### 9. Check Fare
Calculate the ticket price between two stations for a specific class.

*   **Endpoint:** `GET /api/trains/:trainNumber/fare`
*   **Query Parameters:**
    *   `source`: Station code.
    *   `destination`: Station code.
    *   `classCode`: Class code (e.g., SL, 3A, 2A, CC).
*   **Example:** `GET /api/trains/12076/fare?source=TVC&destination=CLT&classCode=CC`

### 10. Check Seat Availability
Check availability status (Available, RAC, WL) for a journey.

*   **Endpoint:** `GET /api/trains/:trainNumber/availability`
*   **Query Parameters:**
    *   `source`: Station code.
    *   `destination`: Station code.
    *   `classCode`: Class code.
    *   `date`: Journey date (YYYY-MM-DD).
*   **Example:** `GET /api/trains/12076/availability?source=TVC&destination=CLT&classCode=CC&date=2026-03-01`

### 11. Book Ticket
Create a new booking and generate a PNR.

*   **Endpoint:** `POST /api/bookings`
*   **Body (JSON):**
    ```json
    {
      "trainNumber": "12076",
      "passengerName": "John Doe",
      "age": 30,
      "source": "TVC",
      "destination": "CLT",
      "date": "2026-03-01",
      "classCode": "CC"
    }
    ```

### 12. Get Booking Status (PNR Status)
Retrieve details of a confirmed booking using its PNR.

*   **Endpoint:** `GET /api/bookings/:pnr`
*   **Example:** `GET /api/bookings/12398402`

---
