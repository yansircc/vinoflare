import { TransformRule, ExecutionContext } from '../../types';
import { BaseTransformer } from './base';

/**
 * Transformer for JSON files (package.json, tsconfig.json, etc.)
 */
export class JsonTransformer extends BaseTransformer {
  canTransform(file: string): boolean {
    return file.endsWith('.json');
  }

  transform(content: string, rule: TransformRule, context: ExecutionContext): string {
    try {
      const json = JSON.parse(content);
      
      switch (rule.transformer) {
        case 'removeDependency':
          return this.removeDependency(json, rule.options);
        case 'removeScript':
          return this.removeScript(json, rule.options);
        case 'updateField':
          return this.updateField(json, rule.options);
        case 'removeField':
          return this.removeField(json, rule.options);
        default:
          return content;
      }
    } catch (error) {
      console.error(`Error parsing JSON: ${error}`);
      return content;
    }
  }

  private removeDependency(json: any, options: any): string {
    const { dependencies } = options;
    
    if (json.dependencies) {
      dependencies.forEach((dep: string) => {
        delete json.dependencies[dep];
      });
    }
    
    if (json.devDependencies) {
      dependencies.forEach((dep: string) => {
        delete json.devDependencies[dep];
      });
    }
    
    return JSON.stringify(json, null, 2);
  }

  private removeScript(json: any, options: any): string {
    const { scripts } = options;
    
    if (json.scripts) {
      scripts.forEach((script: string) => {
        delete json.scripts[script];
      });
    }
    
    return JSON.stringify(json, null, 2);
  }

  private updateField(json: any, options: any): string {
    const { field, value } = options;
    const keys = field.split('.');
    
    let current = json;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    
    return JSON.stringify(json, null, 2);
  }

  private removeField(json: any, options: any): string {
    const { field } = options;
    const keys = field.split('.');
    
    let current = json;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        return JSON.stringify(json, null, 2);
      }
      current = current[keys[i]];
    }
    
    delete current[keys[keys.length - 1]];
    
    return JSON.stringify(json, null, 2);
  }
}