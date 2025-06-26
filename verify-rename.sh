#!/bin/bash

# Script to verify processor renaming was successful

echo "Verifying processor file renaming..."
echo

# Check that old files don't exist
echo "Checking that old .processor.ts files have been removed:"
OLD_FILES=(
    "copy-template.processor.ts"
    "env-vars.processor.ts"
    "git-init.processor.ts"
    "install-dependencies.processor.ts"
    "package-json.processor.ts"
    "project-init.processor.ts"
    "template-inheritance.processor.ts"
    "client-no-db.processor.ts"
    "rule-based-feature-cleanup.processor.ts"
    "unified-file-transform.processor.ts"
    "feature-cleanup.processor.ts"
    "file-transform.processor.ts"
)

for file in "${OLD_FILES[@]}"; do
    if [ -f "src/processors/$file" ]; then
        echo "❌ $file still exists"
    else
        echo "✓ $file removed"
    fi
done

echo
echo "Checking that new .ts files exist:"
NEW_FILES=(
    "copy-template.ts"
    "env-vars.ts"
    "git-init.ts"
    "install-dependencies.ts"
    "package-json.ts"
    "project-init.ts"
    "template-inheritance.ts"
    "client-no-db.ts"
    "rule-based-feature-cleanup.ts"
    "unified-file-transform.ts"
    "feature-cleanup.ts"
    "file-transform.ts"
)

for file in "${NEW_FILES[@]}"; do
    if [ -f "src/processors/$file" ]; then
        echo "✓ $file exists"
    else
        echo "❌ $file missing"
    fi
done

echo
echo "Checking for any remaining .processor imports in TypeScript files:"
if grep -r "\.processor['\"]" src/ --include="*.ts" > /dev/null 2>&1; then
    echo "❌ Found remaining .processor imports:"
    grep -r "\.processor['\"]" src/ --include="*.ts"
else
    echo "✓ No .processor imports found"
fi

echo
echo "Verification complete!"