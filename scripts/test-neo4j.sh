#!/bin/bash

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "Error: jq is not installed. Please install it first."
    echo "Ubuntu/Debian: sudo apt-get install jq"
    echo "MacOS: brew install jq"
    exit 1
fi

API_URL="http://localhost:3000"

# Function to pretty print JSON responses
pretty_print() {
    echo "$1" | jq '.'
}

echo "Registering first user..."
REGISTER_RESPONSE1=$(curl -s -X POST "${API_URL}/users/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser1",
    "email": "test1@example.com",
    "password": "test123456",
    "role": "user"
  }')
echo "Register response (user 1):"
pretty_print "$REGISTER_RESPONSE1"

echo "Registering second user..."
REGISTER_RESPONSE2=$(curl -s -X POST "${API_URL}/users/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser2",
    "email": "test2@example.com",
    "password": "test123456",
    "role": "user"
  }')
echo "Register response (user 2):"
pretty_print "$REGISTER_RESPONSE2"

echo -e "\nLogging in first user..."
LOGIN_RESPONSE1=$(curl -s -X POST "${API_URL}/users/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test1@example.com",
    "password": "test123456"
  }')
echo "Login response (user 1):"
pretty_print "$LOGIN_RESPONSE1"

echo -e "\nLogging in second user..."
LOGIN_RESPONSE2=$(curl -s -X POST "${API_URL}/users/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test2@example.com",
    "password": "test123456"
  }')
echo "Login response (user 2):"
pretty_print "$LOGIN_RESPONSE2"

# Extract user IDs from login responses
USER_ID1=$(echo "$LOGIN_RESPONSE1" | jq -r '._id')
USER_ID2=$(echo "$LOGIN_RESPONSE2" | jq -r '._id')

if [ "$USER_ID1" = "null" ] || [ -z "$USER_ID1" ] || [ "$USER_ID2" = "null" ] || [ -z "$USER_ID2" ]; then
    echo "Error: Failed to get user IDs from login responses"
    exit 1
fi

echo -e "\nCreating a new course..."
COURSE_RESPONSE=$(curl -s -X POST "${API_URL}/courses" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Course",
    "description": "A test course created via API",
    "image": "https://example.com/test-course.jpg"
  }')
echo "Course creation response:"
pretty_print "$COURSE_RESPONSE"

# Extract course ID from creation response
COURSE_ID=$(echo "$COURSE_RESPONSE" | jq -r '._id')

if [ "$COURSE_ID" = "null" ] || [ -z "$COURSE_ID" ]; then
    echo "Error: Failed to get course ID from creation response"
    exit 1
fi

echo -e "\nAdding first user as student to course..."
ADD_STUDENT_RESPONSE1=$(curl -s -X POST "${API_URL}/courses/${COURSE_ID}/student" \
  -H "Content-Type: application/json" \
  -d "{
    \"studentId\": \"${USER_ID1}\"
  }")
echo "Add student response (user 1):"
pretty_print "$ADD_STUDENT_RESPONSE1"

echo -e "\nAdding second user as student to course..."
ADD_STUDENT_RESPONSE2=$(curl -s -X POST "${API_URL}/courses/${COURSE_ID}/student" \
  -H "Content-Type: application/json" \
  -d "{
    \"studentId\": \"${USER_ID2}\"
  }")
echo "Add student response (user 2):"
pretty_print "$ADD_STUDENT_RESPONSE2"

echo -e "\nFirst user rates the course..."
RATING_RESPONSE1=$(curl -s -X POST "${API_URL}/ratings/${COURSE_ID}/${USER_ID1}/4")
echo "Rating response (user 1):"
pretty_print "$RATING_RESPONSE1"

echo -e "\nSecond user rates the course..."
RATING_RESPONSE2=$(curl -s -X POST "${API_URL}/ratings/${COURSE_ID}/${USER_ID2}/5")
echo "Rating response (user 2):"
pretty_print "$RATING_RESPONSE2"

echo -e "\nGetting course rating statistics..."
STATS_RESPONSE=$(curl -s -X GET "${API_URL}/ratings/course/${COURSE_ID}/stats")
echo "Course rating statistics:"
pretty_print "$STATS_RESPONSE"

echo -e "\nFirst user adds a comment..."
COMMENT_RESPONSE1=$(curl -s -X POST "${API_URL}/comments/${COURSE_ID}/${USER_ID1}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Great course!",
    "content": "Really enjoyed the material and presentation."
  }')
echo "Comment response (user 1):"
pretty_print "$COMMENT_RESPONSE1"

echo -e "\nSecond user adds a comment..."
COMMENT_RESPONSE2=$(curl -s -X POST "${API_URL}/comments/${COURSE_ID}/${USER_ID2}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Very informative",
    "content": "Learned a lot from this course."
  }')
echo "Comment response (user 2):"
pretty_print "$COMMENT_RESPONSE2"

# Extract first comment ID
COMMENT_ID1=$(echo "$COMMENT_RESPONSE1" | jq -r '._id')

echo -e "\nFirst user likes their own comment..."
REACTION_RESPONSE1=$(curl -s -X POST "${API_URL}/comments/${COMMENT_ID1}/reaction/${USER_ID1}" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "LIKE"
  }')
echo "Reaction response (user 1):"
pretty_print "$REACTION_RESPONSE1"

echo -e "\nSecond user dislikes first user's comment..."
REACTION_RESPONSE2=$(curl -s -X POST "${API_URL}/comments/${COMMENT_ID1}/reaction/${USER_ID2}" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "DISLIKE"
  }')
echo "Reaction response (user 2):"
pretty_print "$REACTION_RESPONSE2"

echo ">> Press ENTER for proceeding to data deletion <<"
read -r

echo -e "\nDeleting course..."
DELETE_COURSE_RESPONSE=$(curl -s -X DELETE "${API_URL}/courses/${COURSE_ID}")
echo "Delete course response:"
pretty_print "$DELETE_COURSE_RESPONSE"

echo -e "\nDeleting first user..."
DELETE_USER_RESPONSE1=$(curl -s -X DELETE "${API_URL}/users/${USER_ID1}")
echo "Delete user response (user 1):"
pretty_print "$DELETE_USER_RESPONSE1"

echo -e "\nDeleting second user..."
DELETE_USER_RESPONSE2=$(curl -s -X DELETE "${API_URL}/users/${USER_ID2}")
echo "Delete user response (user 2):"
pretty_print "$DELETE_USER_RESPONSE2"

# Check if any curl command failed
if [ $? -ne 0 ]; then
    echo "Error: One or more API calls failed"
    exit 1
fi

echo -e "\nAPI test completed successfully"
