import { ExecutionContext, ProjectConfig, Template, Logger } from '../types';
import { createLogger } from '../utils/logger';

/**
 * Implementation of ExecutionContext
 */
export class ProjectContext implements ExecutionContext {
  public readonly state: Map<string, any> = new Map();

  constructor(
    public readonly projectPath: string,
    public readonly config: ProjectConfig,
    public readonly template: Template,
    public readonly logger: Logger = createLogger()
  ) {}

  /**
   * Get state value with type safety
   */
  getState<T>(key: string): T | undefined {
    return this.state.get(key) as T | undefined;
  }

  /**
   * Set state value
   */
  setState(key: string, value: any): void {
    this.state.set(key, value);
  }

  /**
   * Check if a feature is enabled
   */
  hasFeature(featureName: string): boolean {
    return this.config.features[featureName as keyof typeof this.config.features] === true;
  }

  /**
   * Get template feature configuration
   */
  getFeature(featureName: string) {
    return this.template.features.find(f => f.name === featureName);
  }
}