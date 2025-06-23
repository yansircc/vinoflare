// OpenAPI to TypeScript type generator

import type { OpenAPISchema, SchemaObject } from "./types";

export class OpenAPITypeGenerator {
	private schemas = new Map<string, string>();
	private typeAliases = new Map<string, string>();
	private processedRefs = new Set<string>();

	constructor(private spec: OpenAPISchema) {}

	// Convert OpenAPI schema to TypeScript type
	schemaToTypeScript(schema: SchemaObject, inline = false): string {
		if (!schema) return "unknown";

		// Handle $ref references
		if (schema.$ref) {
			const refName = this.extractRefName(schema.$ref);
			if (!inline && !this.processedRefs.has(refName)) {
				this.processedRefs.add(refName);
				// Process referenced schema
				const refSchema = this.resolveRef(schema.$ref);
				if (refSchema) {
					const typeDef = this.schemaToTypeScript(refSchema, true);
					this.schemas.set(refName, typeDef);
				}
			}
			return refName;
		}

		// Handle nullable
		const isNullable = schema.nullable;
		const baseType = this.getBaseType(schema);

		return isNullable ? `${baseType} | null` : baseType;
	}

	private getBaseType(schema: SchemaObject): string {
		// Handle combinations
		if (schema.allOf) {
			return schema.allOf.map((s) => this.schemaToTypeScript(s)).join(" & ");
		}

		if (schema.oneOf || schema.anyOf) {
			const schemas = schema.oneOf || schema.anyOf || [];
			return schemas.map((s) => this.schemaToTypeScript(s)).join(" | ");
		}

		// Handle basic types
		switch (schema.type) {
			case "string":
				if (schema.enum) {
					return schema.enum.map((v) => `"${v}"`).join(" | ");
				}
				return "string";
			case "number":
			case "integer":
				return "number";
			case "boolean":
				return "boolean";
			case "array":
				return `Array<${this.schemaToTypeScript(schema.items || {})}>`;
			case "object": {
				if (!schema.properties) {
					return schema.additionalProperties
						? `Record<string, ${
								typeof schema.additionalProperties === "object"
									? this.schemaToTypeScript(schema.additionalProperties)
									: "any"
							}>`
						: "Record<string, any>";
				}

				const props = Object.entries(schema.properties)
					.map(([key, prop]) => {
						const isRequired = schema.required?.includes(key) ?? false;
						const propType = this.schemaToTypeScript(prop);
						return `${key}${isRequired ? "" : "?"}: ${propType}`;
					})
					.join(";\n  ");

				return `{\n  ${props}\n}`;
			}
			default:
				return "any";
		}
	}

	private extractRefName(ref: string): string {
		return ref.split("/").pop() || "Unknown";
	}

	private resolveRef(ref: string): SchemaObject | null {
		const parts = ref.split("/");
		if (parts[0] !== "#") return null;

		let current: any = this.spec;
		for (let i = 1; i < parts.length; i++) {
			current = current[parts[i]];
			if (!current) return null;
		}

		return current as SchemaObject;
	}

	generateTypes(): Map<string, string> {
		// Process all component schemas
		if (this.spec.components?.schemas) {
			for (const [name, schema] of Object.entries(
				this.spec.components.schemas,
			)) {
				if (!this.processedRefs.has(name)) {
					this.processedRefs.add(name);
					const typeDef = this.schemaToTypeScript(schema, true);
					this.schemas.set(name, typeDef);
				}
			}
		}

		return this.schemas;
	}

	// Extract default values from schema
	extractDefaults(schema: SchemaObject): Record<string, any> {
		const defaults: Record<string, any> = {};

		if (schema.properties) {
			for (const [key, prop] of Object.entries(schema.properties)) {
				if (prop.default !== undefined) {
					defaults[key] = prop.default;
				} else if (prop.properties) {
					const nestedDefaults = this.extractDefaults(prop);
					if (Object.keys(nestedDefaults).length > 0) {
						defaults[key] = nestedDefaults;
					}
				}
			}
		}

		return defaults;
	}
}
