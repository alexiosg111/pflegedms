#!/bin/bash

# Simple load test script for SQLite
# Creates a temporary DB and inserts/reads data rapidly

echo "Starting System Stress Test..."

DB_FILE="stress_test.db"
rm -f $DB_FILE

# Initialize DB
sqlite3 $DB_FILE "CREATE TABLE test_load (id INTEGER PRIMARY KEY, data TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP);"

echo "Inserting 10,000 records..."
start_time=$(date +%s%3N)

# Using transaction for bulk insert
sqlite3 $DB_FILE <<EOF
BEGIN TRANSACTION;
$(for i in {1..10000}; do echo "INSERT INTO test_load (data) VALUES ('Load test data $i');"; done)
COMMIT;
EOF

end_time=$(date +%s%3N)
duration=$((end_time - start_time))
echo "Insert duration: ${duration}ms"

echo "Reading 10,000 records..."
start_time=$(date +%s%3N)
sqlite3 $DB_FILE "SELECT * FROM test_load;" > /dev/null
end_time=$(date +%s%3N)
duration=$((end_time - start_time))
echo "Read duration: ${duration}ms"

# Cleanup
rm -f $DB_FILE

echo "Stress Test Completed."
