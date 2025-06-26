import { Processor } from '../types';

/**
 * Base processor class with common functionality
 */
export abstract class BaseProcessor implements Processor {
  abstract name: string;
  abstract order: number;

  abstract shouldRun(context: any): boolean;
  abstract process(context: any): Promise<void>;

  async rollback?(context: any): Promise<void> {
    // Default: no rollback
  }
}

/**
 * Processor execution options
 */
export interface ProcessorOptions {
  continueOnError?: boolean;
  parallel?: boolean;
}