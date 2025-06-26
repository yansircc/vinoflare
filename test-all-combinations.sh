#!/bin/bash

# Test script for create-vino-app
# This script tests all possible combinations of project configurations

set -e

echo "🧪 Testing all create-vino-app combinations..."
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Base test directory
TEST_DIR="./test-output"

# Clean up previous test directory
rm -rf $TEST_DIR
mkdir -p $TEST_DIR

# Function to test a configuration
test_config() {
    local name=$1
    local type=$2
    local db=$3
    local auth=$4
    local description=$5
    
    echo "📦 Testing: $description"
    echo "   Name: $name"
    echo "   Type: $type"
    echo "   Database: $db"
    echo "   Auth: $auth"
    
    cd $TEST_DIR
    
    # Build command
    cmd="bunx ../create-vino-app $name --type=$type"
    
    if [ "$db" = "no" ]; then
        cmd="$cmd --no-db"
    fi
    
    if [ "$auth" = "no" ]; then
        cmd="$cmd --no-auth"
    fi
    
    cmd="$cmd -y --no-git --pm=bun"
    
    # Run the command
    if $cmd > /dev/null 2>&1; then
        echo -e "   ${GREEN}✓ Created successfully${NC}"
        
        # Check if the project builds
        cd $name
        if bun run build > /dev/null 2>&1; then
            echo -e "   ${GREEN}✓ Build successful${NC}"
        else
            echo -e "   ${RED}✗ Build failed${NC}"
        fi
        cd ..
    else
        echo -e "   ${RED}✗ Creation failed${NC}"
    fi
    
    cd ..
    echo ""
}

# Test all combinations

# Full-stack configurations
test_config "fs-full" "full-stack" "yes" "yes" "Full-stack with DB and Auth"
test_config "fs-db-noauth" "full-stack" "yes" "no" "Full-stack with DB, no Auth"
test_config "fs-minimal" "full-stack" "no" "no" "Full-stack minimal (no DB, no Auth)"

# API-only configurations
test_config "api-full" "api-only" "yes" "yes" "API-only with DB and Auth"
test_config "api-db-noauth" "api-only" "yes" "no" "API-only with DB, no Auth"
test_config "api-minimal" "api-only" "no" "no" "API-only minimal (no DB, no Auth)"

echo "🎉 All tests completed!"
echo ""
echo "Test results are in: $TEST_DIR"