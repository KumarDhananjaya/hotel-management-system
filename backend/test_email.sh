#!/bin/bash

# Generate random room number
ROOM_NUM="10$(date +%S)"

# 1. Register (ignore error if already exists)
echo "Registering..."
curl -s -X POST http://localhost:8080/api/auth/register \
-H "Content-Type: application/json" \
-d '{"name": "Test Admin", "email": "testadmin@example.com", "password": "password", "role": "ADMIN"}'

# 2. Login
echo "\nLogging in..."
LOGIN_RESP=$(curl -s -X POST http://localhost:8080/api/auth/login \
-H "Content-Type: application/json" \
-d '{"email": "testadmin@example.com", "password": "password"}')

TOKEN=$(echo $LOGIN_RESP | python3 -c "import sys, json; print(json.load(sys.stdin)['token'])")

echo "\nToken: $TOKEN"

if [ -z "$TOKEN" ]; then
    echo "Failed to get token"
    exit 1
fi

# 3. Create Room
echo "\nCreating Room $ROOM_NUM..."
ROOM_RESP=$(curl -s -X POST http://localhost:8080/api/rooms \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $TOKEN" \
-d "{\"roomNumber\": \"$ROOM_NUM\", \"type\": \"SINGLE\", \"price\": 100.00, \"status\": \"AVAILABLE\", \"description\": \"Test Room\"}")

echo "Room Resp: $ROOM_RESP"
ROOM_ID=$(echo $ROOM_RESP | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")
echo "Room ID: $ROOM_ID"

if [ -z "$ROOM_ID" ]; then
    echo "Failed to create room"
    exit 1
fi

# 4. Create Booking
echo "\nCreating Booking..."
curl -v -X POST http://localhost:8080/api/bookings \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $TOKEN" \
-d "{
    \"room\": {\"id\": $ROOM_ID},
    \"guest\": {\"id\": 1, \"name\": \"Kumar\", \"email\": \"kumardhananjaya.edu@gmail.com\"},
    \"checkInDate\": \"2024-01-01\",
    \"checkOutDate\": \"2024-01-05\",
    \"totalAmount\": 500.00
}"
