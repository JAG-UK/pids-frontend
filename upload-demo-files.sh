#!/bin/bash

# Simple File Upload to MinIO Script
# Usage: ./upload-demo-files.sh <local_file> <minio_path>
# Example: ./upload-demo-files.sh resources.zip datasets/689af8c01123d0aec90d21c6/resources.zip

set -e

# Configuration
API_BASE_URL="http://localhost:3000/api"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to show usage
show_usage() {
    echo -e "${BLUE}📤 PIDS File Upload Script${NC}"
    echo "================================"
    echo ""
    echo "Usage: $0 <local_file> <minio_path>"
    echo ""
    echo "Arguments:"
    echo "  local_file   Path to the local file you want to upload"
    echo "  minio_path   Destination path in MinIO (e.g., datasets/uuid/filename)"
    echo ""
    echo "Examples:"
    echo "  $0 resources.zip datasets/689af8c01123d0aec90d21c6/resources.zip"
    echo "  $0 ./data/sample.csv datasets/demo/sample.csv"
    echo "  $0 manifest.json manifests/demo_manifest.json"
    echo ""
    echo "The script will:"
    echo "  1. Authenticate as admin with Keycloak"
    echo "  2. Upload your file to the specified MinIO path"
    echo "  3. Report success or failure"
}

# Function to get admin token
get_admin_token() {
    echo -e "${BLUE}🔐 Getting admin authentication token...${NC}"
    
    # First, get Keycloak config
    echo -e "${YELLOW}📡 Getting Keycloak configuration...${NC}"
    KEYCLOAK_CONFIG=$(curl -s "$API_BASE_URL/auth/keycloak-config")
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to get Keycloak config${NC}"
        exit 1
    fi
    
    # Extract Keycloak URL
    KEYCLOAK_URL=$(echo "$KEYCLOAK_CONFIG" | jq -r '.data.url' | sed 's|http://keycloak:8080|http://localhost:8081|g')
    REALM=$(echo "$KEYCLOAK_CONFIG" | jq -r '.data.realm')
    CLIENT_ID=$(echo "$KEYCLOAK_CONFIG" | jq -r '.data.clientId')
    
    echo -e "${GREEN}✅ Keycloak config retrieved${NC}"
    echo -e "${BLUE}   URL: $KEYCLOAK_URL${NC}"
    echo -e "${BLUE}   Realm: $REALM${NC}"
    echo -e "${BLUE}   Client: $CLIENT_ID${NC}"
    
    # Check if Keycloak is accessible
    echo -e "${YELLOW}🔍 Checking Keycloak accessibility...${NC}"
    if ! curl -s "$KEYCLOAK_URL/realms/$REALM" > /dev/null; then
        echo -e "${RED}❌ Keycloak is not accessible at $KEYCLOAK_URL${NC}"
        echo -e "${YELLOW}💡 Make sure Keycloak is running and accessible${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Keycloak is accessible${NC}"
    
    # Prompt for admin credentials
    echo -e "${YELLOW}🔑 Please enter admin credentials:${NC}"
    read -p "Username: " ADMIN_USERNAME
    read -s -p "Password: " ADMIN_PASSWORD
    echo
    
    # Get token from Keycloak
    echo -e "${YELLOW}🔐 Authenticating with Keycloak...${NC}"
    TOKEN_RESPONSE=$(curl -s -X POST "$KEYCLOAK_URL/realms/$REALM/protocol/openid-connect/token" \
        -d "grant_type=password" \
        -d "client_id=$CLIENT_ID" \
        -d "username=$ADMIN_USERNAME" \
        -d "password=$ADMIN_PASSWORD")
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to authenticate with Keycloak${NC}"
        exit 1
    fi
    
    # Extract access token
    ACCESS_TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r '.access_token')
    
    if [ "$ACCESS_TOKEN" = "null" ] || [ "$ACCESS_TOKEN" = "" ]; then
        echo -e "${RED}❌ Authentication failed${NC}"
        echo -e "${YELLOW}Response: $TOKEN_RESPONSE${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Admin authentication successful${NC}"
    echo -e "${BLUE}   Token: ${ACCESS_TOKEN:0:20}...${NC}"
}

# Function to upload file to MinIO via API
upload_file_to_minio() {
    local file_path="$1"
    local minio_path="$2"
    local access_token="$3"
    
    echo -e "${YELLOW}📤 Uploading $file_path to MinIO path: $minio_path${NC}"
    
    # Check if local file exists
    if [ ! -f "$file_path" ]; then
        echo -e "${RED}❌ Local file not found: $file_path${NC}"
        return 1
    fi
    
    # Get file size for progress indication
    local file_size=$(stat -f%z "$file_path" 2>/dev/null || stat -c%s "$file_path" 2>/dev/null || echo "unknown")
    echo -e "${BLUE}   File size: $file_size bytes${NC}"
    
    # Upload file using the API
    echo -e "${YELLOW}   Uploading...${NC}"
    UPLOAD_RESPONSE=$(curl -s -X POST "$API_BASE_URL/files/upload" \
        -H "Authorization: Bearer $access_token" \
        -F "file=@$file_path" \
        -F "path=$minio_path")
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Upload failed for $file_path${NC}"
        return 1
    fi
    
    # Check if upload was successful
    if echo "$UPLOAD_RESPONSE" | jq -e '.success' > /dev/null; then
        echo -e "${GREEN}✅ Upload successful: $minio_path${NC}"
        return 0
    else
        echo -e "${RED}❌ Upload failed: $UPLOAD_RESPONSE${NC}"
        return 1
    fi
}

# Main execution
main() {
    # Check arguments
    if [ $# -ne 2 ]; then
        echo -e "${RED}❌ Invalid number of arguments${NC}"
        echo ""
        show_usage
        exit 1
    fi
    
    local local_file="$1"
    local minio_path="$2"
    
    echo -e "${BLUE}🚀 Starting file upload...${NC}"
    echo "=================================="
    echo -e "${BLUE}📁 Local file: $local_file${NC}"
    echo -e "${BLUE}🎯 MinIO path: $minio_path${NC}"
    echo ""
    
    # Check dependencies
    if ! command -v jq &> /dev/null; then
        echo -e "${RED}❌ jq is required but not installed${NC}"
        echo -e "${YELLOW}💡 Install with: brew install jq (macOS) or apt-get install jq (Ubuntu)${NC}"
        exit 1
    fi
    
    if ! command -v curl &> /dev/null; then
        echo -e "${RED}❌ curl is required but not installed${NC}"
        exit 1
    fi
    
    # Check if API is accessible
    echo -e "${YELLOW}🔍 Checking API accessibility...${NC}"
    if ! curl -s "$API_BASE_URL/health" > /dev/null 2>&1; then
        echo -e "${RED}❌ API is not accessible at $API_BASE_URL${NC}"
        echo -e "${YELLOW}💡 Make sure the API service is running${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ API is accessible${NC}"
    
    # Get admin token
    get_admin_token
    
    # Upload the file
    if upload_file_to_minio "$local_file" "$minio_path" "$ACCESS_TOKEN"; then
        echo ""
        echo -e "${GREEN}🎉 File upload completed successfully!${NC}"
        echo -e "${BLUE}   File is now available at: $minio_path${NC}"
    else
        echo ""
        echo -e "${RED}❌ File upload failed${NC}"
        exit 1
    fi
}

# Run main function
main "$@"
