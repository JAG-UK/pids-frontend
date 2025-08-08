#!/bin/bash

# Test Manifest Upload Script
# This script tests the manifest upload functionality

echo "🔍 Testing Manifest Upload..."
echo ""

# Create a test manifest file
echo "📝 Creating test manifest..."
cat > test-manifest.json << 'EOF'
{
    "@spec": "https://raw.githubusercontent.com/fidlabs/data-prep-standard/refs/heads/main/specification/v0/FilecoinDataPreparationManifestSpecification.md",
    "@spec_version": "0.1.0",
    "@type": "super-manifest",
    "name": "Test Dogs Dataset",
    "description": "Test pictures of dogs for manifest upload",
    "version": "2025-03-25",
    "open_with": "web browser",
    "license": "Apache-2.0 or MIT",
    "project_url": "https://dog.ceo/dog-api/",
    "uuid": "7DD30437-56C9-487B-8DF6-62C7DA251EF1",
    "n_pieces": 2,
    "tags": ["dogs", "cute", "test"],
    "pieces": [
        {
            "piece_cid": "bafkreiaw7ga7qnz2jazjh5i7ymarpojwlptatlps4rj7w4yqvey3yucb74",
            "payload_cid": "bafkreibczfhzp2gyoimvtxrm6yy6m43eqbaunp2qnuqryt2npzokw4cfki"
        },
        {
            "piece_cid": "bafkreig5chwsxzyow7pc7iiokxibmxvqspubnabjzo65lctoxthvavc35q",
            "payload_cid": "bafkreicvlypxbttltn6oo6wqpoulfnvtuvb3fr6mr7qvulbqvunyszt6ee"
        }
    ],
    "contents": [
        {
            "@type": "directory",
            "name": "dogs",
            "contents": [
                {
                    "@type": "file",
                    "name": "rover.jpeg",
                    "hash": "bdc1d51b183d5ad329fadba55bba6d0988d6180ddd9d606df54dd56a6f43ef42",
                    "cid": "bafkreiflb6kpfyupgm42tfq55ag3sr3qv3nqiw625jdriyx6wr5ewynppe",
                    "byte_length": 17376,
                    "media_type": "image/jpeg",
                    "piece_cid": "bafkreiaw7ga7qnz2jazjh5i7ymarpojwlptatlps4rj7w4yqvey3yucb74"
                }
            ]
        }
    ]
}
EOF

echo "✅ Test manifest created"

# Test 1: Upload manifest
echo ""
echo "1️⃣ Testing manifest upload..."
response=$(curl -s -X POST \
  -F "manifest=@test-manifest.json" \
  http://localhost:3000/api/datasets/upload-manifest)

echo "📡 Upload response:"
echo "$response" | jq '.' 2>/dev/null || echo "$response"

# Extract dataset ID if successful
dataset_id=$(echo "$response" | jq -r '.data.id' 2>/dev/null)
if [ "$dataset_id" != "null" ] && [ "$dataset_id" != "" ]; then
    echo "✅ Manifest uploaded successfully, dataset ID: $dataset_id"
    
    # Test 2: Get the uploaded dataset
    echo ""
    echo "2️⃣ Testing dataset retrieval..."
    dataset_response=$(curl -s http://localhost:3000/api/datasets/$dataset_id)
    echo "📊 Dataset response:"
    echo "$dataset_response" | jq '.' 2>/dev/null || echo "$dataset_response"
    
    # Test 3: Get manifest file
    echo ""
    echo "3️⃣ Testing manifest file retrieval..."
    manifest_response=$(curl -s http://localhost:3000/api/files/manifest/$dataset_id)
    echo "📄 Manifest file response (first 200 chars):"
    echo "$manifest_response" | head -c 200
    echo "..."
    
else
    echo "❌ Manifest upload failed"
fi

# Cleanup
echo ""
echo "🧹 Cleaning up..."
rm -f test-manifest.json

echo ""
echo "🎯 Summary:"
echo "   - Manifest upload should work without authentication"
echo "   - Dataset should be created with 'pending' status"
echo "   - Manifest file should be saved to MinIO"
echo "   - Dataset should be retrievable via API"
echo "   - Manifest file should be accessible via /api/files/manifest/:id"
