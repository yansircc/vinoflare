import { BaseProcessor } from './types';
import { ExecutionContext } from '../types';
import { removeFiles } from '../utils/fs';

/**
 * Processor for cleaning up files based on disabled features
 */
export class FeatureCleanupProcessor extends BaseProcessor {
  name = 'feature-cleanup';
  order = 30;

  shouldRun(): boolean {
    return true;
  }

  async process(context: ExecutionContext): Promise<void> {
    context.logger.info('Processing feature configuration...');
    
    for (const feature of context.template.features) {
      // Skip if feature is enabled
      if (!feature.optional || context.hasFeature(feature.name)) {
        continue;
      }
      
      // Check dependencies
      if (feature.requires) {
        const missingDeps = feature.requires.filter(
          dep => !context.hasFeature(dep)
        );
        if (missingDeps.length > 0) {
          context.logger.warn(
            `Feature '${feature.name}' requires: ${missingDeps.join(', ')}`
          );
        }
      }
      
      // Remove files for disabled feature
      if (feature.files.remove) {
        context.logger.debug(`Removing files for disabled feature: ${feature.name}`);
        await removeFiles(context.projectPath, feature.files.remove);
      }
    }
    
    context.logger.success('Feature configuration processed');
  }
}