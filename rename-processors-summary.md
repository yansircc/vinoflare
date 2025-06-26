# Processor File Renaming Summary

## Files to be renamed (using git mv):

### Standard processor files:
1. `copy-template.processor.ts` → `copy-template.ts`
2. `env-vars.processor.ts` → `env-vars.ts`
3. `git-init.processor.ts` → `git-init.ts`
4. `install-dependencies.processor.ts` → `install-dependencies.ts`
5. `package-json.processor.ts` → `package-json.ts`
6. `project-init.processor.ts` → `project-init.ts`
7. `template-inheritance.processor.ts` → `template-inheritance.ts`

### Additional processor files found:
8. `client-no-db.processor.ts` → `client-no-db.ts`
9. `rule-based-feature-cleanup.processor.ts` → `rule-based-feature-cleanup.ts`
10. `unified-file-transform.processor.ts` → `unified-file-transform.ts`

### Files that need special handling:
- `feature-cleanup.processor.ts` - Will be removed (it's just a placeholder pointing to rule-based-feature-cleanup.processor.ts)
- `file-transform.processor.ts` - Will be removed (it's just a placeholder pointing to unified-file-transform.processor.ts)

## Import updates completed:
✓ Updated all imports in `src/main.ts` (7 imports updated)

## Next steps:
1. Run the rename script: `bash rename-processors.sh`
2. The script will automatically:
   - Rename all `.processor.ts` files to `.ts`
   - Remove the placeholder files (`feature-cleanup.processor.ts` and `file-transform.processor.ts`)
3. Commit the changes

## Notes:
- No other files in the codebase import the processor files directly
- The registry.ts and project-builder.ts only use type imports from the registry, not individual processors