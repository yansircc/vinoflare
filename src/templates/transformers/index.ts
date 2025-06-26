import { FileTransformer, TransformRule, ExecutionContext } from '../../types';
import { TypeScriptTransformer } from './typescript';
import { JsonTransformer } from './json';

/**
 * Transformer manager that delegates to appropriate transformers
 */
export class TransformerManager {
  private transformers: FileTransformer[] = [];

  constructor() {
    // Register default transformers
    this.register(new TypeScriptTransformer());
    this.register(new JsonTransformer());
  }

  /**
   * Register a new transformer
   */
  register(transformer: FileTransformer): void {
    this.transformers.push(transformer);
  }

  /**
   * Transform file content based on rules
   */
  async transformFile(
    filePath: string,
    content: string,
    rules: TransformRule[],
    context: ExecutionContext
  ): Promise<string> {
    let transformedContent = content;

    for (const rule of rules) {
      const transformer = this.findTransformer(filePath);
      if (transformer) {
        transformedContent = transformer.transform(transformedContent, rule, context);
      }
    }

    return transformedContent;
  }

  /**
   * Find appropriate transformer for a file
   */
  private findTransformer(filePath: string): FileTransformer | undefined {
    return this.transformers.find(t => t.canTransform(filePath));
  }
}

// Export singleton instance
export const transformerManager = new TransformerManager();