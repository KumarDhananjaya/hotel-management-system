# Quick Test Data Creation Script

Use this guide to quickly add test data to your Hotel Management System.

## Already Created ✅
- User: test@hotel.com / test123
- Room: 101 (Single, $99.99)
- Guest: John Doe

---

## Step 1: Add More Rooms

**Go to:** http://localhost:5174/rooms

Click "Add Room" for each:

### Room 2:
```
Room Number: 201
Type: Double
Price: 149.99
Status: Available
Description: Spacious double room with balcony
```

### Room 3:
```
Room Number: 301
Type: Suite
Price: 299.99
Status: Available
Description: Luxury suite with ocean view and jacuzzi
```

### Room 4:
```
Room Number: 102
Type: Single
Price: 89.99
Status: Maintenance
Description: Single room under renovation
```

**Expected:** You should now see 4 rooms total

---

## Step 2: Add More Guests

**Go to:** http://localhost:5174/guests

Click "Add Guest" for each:

### Guest 2:
```
Name: Sarah Johnson
Email: sarah.j@email.com
Phone: +1 555-0101
Address: 123 Main St, New York, NY 10001
```

### Guest 3:
```
Name: Michael Chen
Email: michael.c@email.com
Phone: +1 555-0102
Address: 456 Oak Ave, Los Angeles, CA 90001
```

### Guest 4:
```
Name: Emily Davis
Email: emily.d@email.com
Phone: +1 555-0103
Address: 789 Pine Rd, Chicago, IL 60601
```

**Expected:** You should now see 4 guests total

**Test Search:** Type "Sarah" → Should show only Sarah Johnson

---

## Step 3: Create Bookings

**Go to:** http://localhost:5174/bookings

Click "New Booking" for each:

### Booking 1:
```
Guest: Sarah Johnson - sarah.j@email.com
Room: Room 201 - DOUBLE ($149.99/night)
Check-in Date: [Today's date - use date picker]
Check-out Date: [3 days from today]
Total Amount: 449.97
Status: Confirmed
```

### Booking 2:
```
Guest: Michael Chen - michael.c@email.com
Room: Room 301 - SUITE ($299.99/night)
Check-in Date: [Tomorrow's date]
Check-out Date: [5 days from tomorrow]
Total Amount: 1499.95
Status: Confirmed
```

### Booking 3:
```
Guest: John Doe - john@test.com
Room: Room 101 - SINGLE ($99.99/night)
Check-in Date: [2 days from today]
Check-out Date: [4 days from today]
Total Amount: 199.98
Status: Pending
```

**Expected:** You should see 3 bookings in the table

**Test Cancel:** 
- Click "Cancel" on Booking 3 (John Doe's booking)
- Confirm the cancellation
- Status should change to CANCELLED
- Cancel button should disappear

---

## Step 4: Process Payments

**Go to:** http://localhost:5174/payments

Click "Process Payment" for each:

### Payment 1:
```
Booking: Select "Booking #1 - Sarah Johnson - Room 201"
Amount: 449.97 (should auto-fill)
Payment Method: Credit/Debit Card
Status: Paid
```

### Payment 2:
```
Booking: Select "Booking #2 - Michael Chen - Room 301"
Amount: 1499.95 (should auto-fill)
Payment Method: UPI
Status: Paid
```

**Expected:** 
- 2 payments in the table
- Total Revenue: $1,949.92
- Total Payments: 2
- Pending Payments: 0

---

## Step 5: Verify Dashboard

**Go to:** http://localhost:5174/ (Dashboard)

**Expected Statistics:**
```
📊 Total Rooms: 4
👥 Total Guests: 4
📅 Total Bookings: 3
💰 Total Revenue: $1,949.92
```

---

## Feature Testing Checklist

### ✅ Test Each Feature:

**Rooms:**
- [ ] View all 4 rooms
- [ ] See different types (Single, Double, Suite)
- [ ] See different statuses (Available, Maintenance)
- [ ] Room cards show price and description

**Guests:**
- [ ] View all 4 guests in table
- [ ] Search for "Sarah" → Shows only Sarah
- [ ] Search for "555" → Shows all guests with that phone prefix
- [ ] Clear search → Shows all guests again

**Bookings:**
- [ ] View all 3 bookings
- [ ] See color-coded status badges (green=Confirmed, yellow=Pending, red=Cancelled)
- [ ] Guest and room details visible
- [ ] Dates displayed correctly
- [ ] Cancel button works
- [ ] Cancelled bookings show no cancel button

**Payments:**
- [ ] View all 2 payments
- [ ] Payment statistics cards show correct numbers
- [ ] Payment method icons display
- [ ] Booking details visible in payment table
- [ ] Amount auto-fills when booking selected

**Dashboard:**
- [ ] All 4 statistics cards show correct numbers
- [ ] Revenue matches total of paid payments
- [ ] Counts match actual data

**Navigation:**
- [ ] All navbar links work
- [ ] Can navigate between all pages
- [ ] Logout button works
- [ ] After logout, redirected to login page

---

## Advanced Testing

### Test Form Validation:

**Try these to verify validation works:**

1. **Empty Form Submission:**
   - Open any "Add" modal
   - Try to submit without filling fields
   - Should show browser validation errors

2. **Invalid Email:**
   - Try adding guest with email: "notanemail"
   - Should show email validation error

3. **Invalid Dates:**
   - Try creating booking with check-out before check-in
   - Should prevent submission

4. **Negative Numbers:**
   - Try adding room with negative price
   - Should prevent submission

### Test Search:

1. **Guest Search:**
   - Search by name: "Sarah"
   - Search by email: "sarah.j"
   - Search by phone: "0101"
   - Clear search

### Test Cancel:

1. **Cancel Booking:**
   - Cancel a confirmed booking
   - Verify status changes
   - Try to cancel again (button should be gone)

---

## Expected Final State

After completing all steps:

**Rooms:** 4 total
- 101 (Single, $99.99, Available)
- 201 (Double, $149.99, Available)
- 301 (Suite, $299.99, Available)
- 102 (Single, $89.99, Maintenance)

**Guests:** 4 total
- John Doe
- Sarah Johnson
- Michael Chen
- Emily Davis

**Bookings:** 3 total
- Sarah → Room 201 (Confirmed)
- Michael → Room 301 (Confirmed)
- John → Room 101 (Cancelled)

**Payments:** 2 total
- Sarah's booking: $449.97 (Card, Paid)
- Michael's booking: $1,499.95 (UPI, Paid)

**Dashboard:**
- Rooms: 4
- Guests: 4
- Bookings: 3
- Revenue: $1,949.92

---

## Troubleshooting

**Issue:** Modal doesn't open
- **Fix:** Refresh the page and try again

**Issue:** Form doesn't submit
- **Fix:** Check all required fields are filled

**Issue:** Data doesn't show
- **Fix:** Refresh the page

**Issue:** Can't select room in booking
- **Fix:** Make sure room status is "Available"

**Issue:** Payment amount doesn't auto-fill
- **Fix:** Select a booking first, then amount will populate

---

## Time Estimate

- Adding all rooms: ~3 minutes
- Adding all guests: ~3 minutes
- Creating all bookings: ~4 minutes
- Processing payments: ~2 minutes
- **Total: ~12 minutes**

---

**Happy Testing! 🎉**

Once you complete this, you'll have a fully populated system ready for demonstration!
