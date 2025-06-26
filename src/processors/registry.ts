import { Processor } from '../types';

/**
 * Registry for managing processors
 */
export class ProcessorRegistry {
  private processors: Map<string, Processor> = new Map();

  /**
   * Register a processor
   */
  register(processor: Processor): void {
    if (this.processors.has(processor.name)) {
      throw new Error(`Processor '${processor.name}' is already registered`);
    }
    this.processors.set(processor.name, processor);
  }

  /**
   * Register multiple processors
   */
  registerAll(processors: Processor[]): void {
    processors.forEach(p => this.register(p));
  }

  /**
   * Get a processor by name
   */
  get(name: string): Processor | undefined {
    return this.processors.get(name);
  }

  /**
   * Get all processors
   */
  getAll(): Processor[] {
    return Array.from(this.processors.values());
  }

  /**
   * Get processors sorted by order
   */
  getOrderedProcessors(): Processor[] {
    return this.getAll().sort((a, b) => a.order - b.order);
  }

  /**
   * Clear all processors
   */
  clear(): void {
    this.processors.clear();
  }
}