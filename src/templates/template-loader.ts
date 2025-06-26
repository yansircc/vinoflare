import path from 'path';
import { fileURLToPath } from 'url';
import { Template, TemplateFeature } from '../types';
import { readJSON, pathExists } from '../utils/fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Load and manage templates
 */
export class TemplateLoader {
  private templatesDir: string;

  constructor(templatesDir?: string) {
    this.templatesDir = templatesDir || path.join(__dirname, '../../templates');
  }

  /**
   * Load a template by name
   */
  async loadTemplate(templateName: string): Promise<Template> {
    const templatePath = path.join(this.templatesDir, templateName);
    const configPath = path.join(templatePath, 'template.json');
    
    // Check if template exists
    if (!await pathExists(templatePath)) {
      throw new Error(`Template '${templateName}' not found`);
    }
    
    // Load template configuration if exists
    let config: any = {};
    if (await pathExists(configPath)) {
      config = await readJSON(configPath);
    }
    
    // Build template object
    const template: Template = {
      name: templateName,
      description: config.description || `${templateName} template`,
      path: templatePath,
      features: config.features || [],
      scripts: config.scripts || {},
    };
    
    return this.validateTemplate(template);
  }

  /**
   * Validate template configuration
   */
  private validateTemplate(template: Template): Template {
    // Ensure features have required fields
    template.features = template.features.map(feature => ({
      name: feature.name,
      enabled: feature.enabled !== false,
      optional: feature.optional !== false,
      requires: feature.requires || [],
      conflicts: feature.conflicts || [],
      files: {
        remove: feature.files?.remove || [],
        add: feature.files?.add || {},
        transform: feature.files?.transform || {},
      },
      dependencies: {
        add: feature.dependencies?.add || {},
        remove: feature.dependencies?.remove || [],
      },
    }));
    
    return template;
  }

  /**
   * Get available templates
   */
  async getAvailableTemplates(): Promise<string[]> {
    const fs = await import('fs/promises');
    const entries = await fs.readdir(this.templatesDir, { withFileTypes: true });
    
    return entries
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name);
  }
}