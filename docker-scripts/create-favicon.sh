#!/bin/bash

# Create favicon directory if it doesn't exist
mkdir -p docker-scripts/favicon

# Create a simple favicon.ico file
cat > docker-scripts/favicon/favicon.ico << EOF
EOF

# Create apple-touch-icon files to prevent 404 errors
cat > docker-scripts/favicon/apple-touch-icon.png << EOF
EOF

cat > docker-scripts/favicon/apple-touch-icon-precomposed.png << EOF
EOF

echo "Created favicon files to prevent 404 errors"
