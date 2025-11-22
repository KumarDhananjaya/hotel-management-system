# Hotel Management System - Testing Guide

## Quick Start Testing

Your HMS is running on:
- **Backend:** http://localhost:8080
- **Frontend:** http://localhost:5174

---

## Step-by-Step Testing Guide

### 1. Register a User Account

**Navigate to:** http://localhost:5174/register

**Test Data:**
```
Name: John Admin
Email: admin@hotel.com
Password: admin123
```

Click **Register** → You'll be redirected to login page

---

### 2. Login

**Navigate to:** http://localhost:5174/login

**Credentials:**
```
Email: admin@hotel.com
Password: admin123
```

Click **Login** → You'll see the Dashboard

---

### 3. Test Dashboard

**What to see:**
- Statistics cards showing 0 rooms, 0 guests, 0 bookings, $0 revenue
- This will update as you add data

---

### 4. Add Rooms

**Navigate to:** Rooms page (click "Rooms" in navbar)

**Click "Add Room"** and create these test rooms:

#### Room 1:
```
Room Number: 101
Type: Single
Price: 99.99
Status: Available
Description: Cozy single room with city view
```

#### Room 2:
```
Room Number: 201
Type: Double
Price: 149.99
Status: Available
Description: Spacious double room with balcony
```

#### Room 3:
```
Room Number: 301
Type: Suite
Price: 299.99
Status: Available
Description: Luxury suite with ocean view and jacuzzi
```

#### Room 4:
```
Room Number: 102
Type: Single
Price: 89.99
Status: Maintenance
Description: Single room under renovation
```

**Expected Result:** You should see 4 room cards displayed

---

### 5. Add Guests

**Navigate to:** Guests page

**Click "Add Guest"** and create these test guests:

#### Guest 1:
```
Name: Sarah Johnson
Email: sarah.j@email.com
Phone: +1 555-0101
Address: 123 Main St, New York, NY 10001
```

#### Guest 2:
```
Name: Michael Chen
Email: michael.c@email.com
Phone: +1 555-0102
Address: 456 Oak Ave, Los Angeles, CA 90001
```

#### Guest 3:
```
Name: Emily Davis
Email: emily.d@email.com
Phone: +1 555-0103
Address: 789 Pine Rd, Chicago, IL 60601
```

**Expected Result:** You should see 3 guests in the table

**Test Search:** Type "Sarah" in the search box → Only Sarah Johnson should appear

---

### 6. Create Bookings

**Navigate to:** Bookings page

**Click "New Booking"** and create these test bookings:

#### Booking 1:
```
Guest: Sarah Johnson - sarah.j@email.com
Room: Room 101 - SINGLE ($99.99/night)
Check-in Date: [Today's date]
Check-out Date: [3 days from today]
Total Amount: 299.97
Status: Confirmed
```

#### Booking 2:
```
Guest: Michael Chen - michael.c@email.com
Room: Room 201 - DOUBLE ($149.99/night)
Check-in Date: [Tomorrow's date]
Check-out Date: [5 days from tomorrow]
Total Amount: 749.95
Status: Pending
```

#### Booking 3:
```
Guest: Emily Davis - emily.d@email.com
Room: Room 301 - SUITE ($299.99/night)
Check-in Date: [2 days from today]
Check-out Date: [7 days from today]
Total Amount: 1499.95
Status: Confirmed
```

**Expected Result:** You should see 3 bookings in the table with color-coded status badges

**Test Cancel:** Click "Cancel" on Booking 2 → Status should change to CANCELLED

---

### 7. Process Payments

**Navigate to:** Payments page

**Click "Process Payment"** and create these test payments:

#### Payment 1:
```
Booking: Booking #1 - Sarah Johnson - Room 101 ($299.97)
Amount: 299.97 (auto-filled)
Payment Method: Credit/Debit Card
Status: Paid
```

#### Payment 2:
```
Booking: Booking #3 - Emily Davis - Room 301 ($1499.95)
Amount: 1499.95 (auto-filled)
Payment Method: UPI
Status: Paid
```

**Expected Result:** 
- You should see 2 payments in the table
- Total Revenue card should show: $1,799.92
- Total Payments card should show: 2
- Pending Payments should show: 0

---

### 8. Verify Dashboard Updates

**Navigate back to:** Dashboard

**Expected Statistics:**
```
Total Rooms: 4
Total Guests: 3
Total Bookings: 3
Total Revenue: $1,799.92
```

---

## Feature Testing Checklist

### ✅ Authentication
- [x] Register new user
- [x] Login with credentials
- [x] Logout (click Logout button)
- [x] Protected routes (try accessing /rooms without login)

### ✅ Room Management
- [x] View all rooms
- [x] Add new room
- [x] See room cards with details
- [x] Different room types (Single, Double, Suite)
- [x] Different statuses (Available, Booked, Maintenance)

### ✅ Guest Management
- [x] View all guests
- [x] Add new guest
- [x] Search guests by name/email/phone
- [x] See guest details in table

### ✅ Booking Management
- [x] View all bookings
- [x] Create new booking
- [x] Select guest from dropdown
- [x] Select available room from dropdown
- [x] Set check-in/check-out dates
- [x] See booking status (Pending, Confirmed, Cancelled)
- [x] Cancel booking

### ✅ Payment Management
- [x] View all payments
- [x] Process payment for booking
- [x] Auto-fill amount from booking
- [x] Select payment method (Card/Cash/UPI)
- [x] See payment statistics
- [x] View payment history

### ✅ Dashboard Analytics
- [x] See total rooms count
- [x] See total guests count
- [x] See total bookings count
- [x] See total revenue

---

## Advanced Testing Scenarios

### Scenario 1: Complete Booking Flow
1. Add a new room (Room 401, Suite, $399.99)
2. Add a new guest (Bob Wilson, bob@email.com)
3. Create booking (Bob → Room 401, 2 nights = $799.98)
4. Process payment ($799.98, Card, Paid)
5. Check dashboard → Revenue should increase

### Scenario 2: Cancellation Flow
1. Create a booking
2. Cancel the booking
3. Verify status changes to CANCELLED
4. Try to cancel again → Button should be disabled

### Scenario 3: Search and Filter
1. Add 5+ guests
2. Use search to find specific guest
3. Verify search works for name, email, and phone

### Scenario 4: Date Validation
1. Try to create booking with check-out before check-in
2. Should not allow (browser validation)

### Scenario 5: Form Validation
1. Try to submit empty forms
2. Try to submit invalid email
3. Verify all required fields are enforced

---

## API Testing (Optional - Using Browser DevTools)

### Open Browser Console (F12)

**Test API Endpoints:**

```javascript
// Get all rooms
fetch('http://localhost:8080/api/rooms', {
    headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
    }
}).then(r => r.json()).then(console.log)

// Get all guests
fetch('http://localhost:8080/api/guests', {
    headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
    }
}).then(r => r.json()).then(console.log)

// Get dashboard stats
fetch('http://localhost:8080/api/analytics/summary', {
    headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
    }
}).then(r => r.json()).then(console.log)
```

---

## Database Verification (Optional)

### Using pgAdmin or psql:

```sql
-- View all tables
\dt

-- Check users
SELECT * FROM users;

-- Check rooms
SELECT * FROM rooms;

-- Check guests
SELECT * FROM guests;

-- Check bookings with joins
SELECT b.id, g.name as guest_name, r.room_number, b.check_in_date, b.check_out_date, b.total_amount, b.status
FROM bookings b
JOIN guests g ON b.guest_id = g.id
JOIN rooms r ON b.room_id = r.id;

-- Check payments
SELECT p.id, p.amount, p.method, p.status, b.id as booking_id
FROM payments p
JOIN bookings b ON p.booking_id = b.id;

-- Get revenue summary
SELECT SUM(amount) as total_revenue FROM payments WHERE status = 'PAID';
```

---

## Troubleshooting

### Issue: Can't login
**Solution:** Make sure you registered first. Check console for errors.

### Issue: Forms not submitting
**Solution:** Check all required fields are filled. Check browser console for errors.

### Issue: Data not showing
**Solution:** Refresh the page. Check if backend is running on port 8080.

### Issue: CORS errors
**Solution:** Make sure backend is running and CORS is configured for port 5174.

### Issue: 403 Forbidden
**Solution:** Make sure you're logged in. Check if token is in localStorage.

---

## Quick Test Data Summary

### Users
- admin@hotel.com / admin123

### Rooms
- 101 (Single, $99.99, Available)
- 201 (Double, $149.99, Available)
- 301 (Suite, $299.99, Available)
- 102 (Single, $89.99, Maintenance)

### Guests
- Sarah Johnson (sarah.j@email.com, +1 555-0101)
- Michael Chen (michael.c@email.com, +1 555-0102)
- Emily Davis (emily.d@email.com, +1 555-0103)

### Bookings
- Sarah → Room 101 (3 nights, $299.97, Confirmed)
- Michael → Room 201 (5 nights, $749.95, Cancelled)
- Emily → Room 301 (5 nights, $1499.95, Confirmed)

### Payments
- Booking #1: $299.97 (Card, Paid)
- Booking #3: $1499.95 (UPI, Paid)

---

## Expected Final Dashboard

After completing all test data:
```
📊 Total Rooms: 4
👥 Total Guests: 3
📅 Total Bookings: 3
💰 Total Revenue: $1,799.92
```

---

## Demo Script for Presentation

1. **Start:** Show login page → Register → Login
2. **Dashboard:** Show empty dashboard
3. **Rooms:** Add 3 rooms → Show room cards
4. **Guests:** Add 3 guests → Show search feature
5. **Bookings:** Create 2 bookings → Show table
6. **Payments:** Process 2 payments → Show statistics
7. **Dashboard:** Show updated statistics
8. **Cancel:** Cancel a booking → Show status change
9. **Logout:** Demonstrate logout

**Time:** ~10-15 minutes for complete demo

---

## Screenshots to Take

1. Login page
2. Dashboard with statistics
3. Rooms page with cards
4. Add Room modal
5. Guests table with search
6. Add Guest modal
7. Bookings table
8. New Booking modal
9. Payments page with statistics
10. Process Payment modal

---

**Happy Testing! 🎉**
