import { BaseProcessor } from './types';
import { ExecutionContext } from '../types';
import { copyTemplate } from '../utils/fs';

/**
 * Processor for copying template files to project directory
 */
export class CopyTemplateProcessor extends BaseProcessor {
  name = 'copy-template';
  order = 10; // Run early

  shouldRun(): boolean {
    // Always run
    return true;
  }

  async process(context: ExecutionContext): Promise<void> {
    context.logger.info('Copying template files...');
    
    await copyTemplate(context.template.path, context.projectPath);
    
    context.logger.success('Template files copied successfully');
  }
}