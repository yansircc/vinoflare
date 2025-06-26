#!/bin/bash

# Script to rename processor files and update imports

# Navigate to the project directory
cd /Users/yansir/code/tmp/try-cli-v3/create-vino-app

# Rename processor files using git mv
echo "Renaming processor files..."

git mv src/processors/copy-template.processor.ts src/processors/copy-template.ts
echo "✓ Renamed copy-template.processor.ts"

git mv src/processors/env-vars.processor.ts src/processors/env-vars.ts
echo "✓ Renamed env-vars.processor.ts"

git mv src/processors/git-init.processor.ts src/processors/git-init.ts
echo "✓ Renamed git-init.processor.ts"

git mv src/processors/install-dependencies.processor.ts src/processors/install-dependencies.ts
echo "✓ Renamed install-dependencies.processor.ts"

git mv src/processors/package-json.processor.ts src/processors/package-json.ts
echo "✓ Renamed package-json.processor.ts"

git mv src/processors/project-init.processor.ts src/processors/project-init.ts
echo "✓ Renamed project-init.processor.ts"

git mv src/processors/template-inheritance.processor.ts src/processors/template-inheritance.ts
echo "✓ Renamed template-inheritance.processor.ts"

# Also rename other processor files that follow the same pattern
git mv src/processors/client-no-db.processor.ts src/processors/client-no-db.ts
echo "✓ Renamed client-no-db.processor.ts"

git mv src/processors/rule-based-feature-cleanup.processor.ts src/processors/rule-based-feature-cleanup.ts
echo "✓ Renamed rule-based-feature-cleanup.processor.ts"

git mv src/processors/unified-file-transform.processor.ts src/processors/unified-file-transform.ts
echo "✓ Renamed unified-file-transform.processor.ts"

# Remove placeholder files that are no longer needed
if [ -f "src/processors/feature-cleanup.processor.ts" ]; then
    git rm src/processors/feature-cleanup.processor.ts
    echo "✓ Removed placeholder feature-cleanup.processor.ts"
fi

if [ -f "src/processors/file-transform.processor.ts" ]; then
    git rm src/processors/file-transform.processor.ts
    echo "✓ Removed placeholder file-transform.processor.ts"
fi

echo "✓ All processor files renamed successfully!"