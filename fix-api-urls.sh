#!/bin/bash

# Replace hardcoded localhost:8000 with API_URL from config
find src/app -type f \( -name "*.ts" -o -name "*.tsx" \) -print0 | while IFS= read -r -d '' file; do
  # Check if file contains localhost:8000
  if grep -q "localhost:8000" "$file"; then
    echo "Fixing: $file"
    
    # Add import if not present
    if ! grep -q "import.*API_URL.*from.*@/config/api" "$file"; then
      # Add import after the last import statement
      sed -i '' '/^import /a\
import { API_URL } from '\''@/config/api'\'';
' "$file"
    fi
    
    # Replace all hardcoded URLs
    sed -i '' "s|'http://localhost:8000'|\`\${API_URL}\`|g" "$file"
    sed -i '' 's|"http://localhost:8000"|`${API_URL}`|g' "$file"
  fi
done

echo "Done! All hardcoded URLs replaced."
