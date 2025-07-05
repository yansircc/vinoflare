import type { OpenAPIConfig, RouteDefinition } from "./types";

export class OpenAPIGenerator {
    constructor(private routes: RouteDefinition[]) {}

    generate(config: OpenAPIConfig): any {
        const paths: Record<string, any> = {};

        // Group routes by path
        for (const route of this.routes) {
            if (!route.openapi) continue;

            // Convert Hono's :param format to OpenAPI {param} format
            const path = route.path.replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, "{$1}");
            if (!paths[path]) {
                paths[path] = {};
            }

            const operation: any = {
                tags: route.openapi.tags,
                summary: route.openapi.summary,
                description: route.openapi.description,
                deprecated: route.openapi.deprecated,
                security: route.openapi.security,
                responses: {},
            };

            // Add request body if defined
            if (route.openapi.request?.body || route.validation?.body) {
                const schema =
                    route.openapi.request?.body?.schema ||
                    (route.validation?.body
                        ? this.convertSchema(route.validation.body)
                        : undefined);

                if (schema) {
                    operation.requestBody = {
                        description:
                            route.openapi.request?.body?.description || "Request body",
                        required: route.openapi.request?.body?.required !== false,
                        content: {
                            "application/json": {
                                schema,
                            },
                        },
                    };
                }
            }

            const parameters = [
                ...(route.openapi.request?.params || []).map((p) => ({
                    in: "path",
                    name: p.name,
                    description: p.description,
                    required: p.required !== false,
                    schema: p.schema || { type: "string" },
                })),
                ...(route.openapi.request?.query || []).map((p) => ({
                    in: "query",
                    name: p.name,
                    description: p.description,
                    required: p.required !== false,
                    schema: p.schema || { type: "string" },
                })),
            ];

            // Auto-generate param schemas from validation
            if (route.validation?.params && !route.openapi.request?.params) {
                // Check if it's a plain object with Zod schemas
                const paramsObj = route.validation.params;
                
                // If it's an object with Zod schemas as values
                if (typeof paramsObj === "object" && paramsObj !== null) {
                    const entries = Object.entries(paramsObj);
                    const hasZodSchemas = entries.length > 0 && entries.every(([_, value]) => value && typeof value === "object" && "_def" in value);
                    
                    if (hasZodSchemas) {
                        // It's a plain object like { id: z.string() }
                        for (const [name, zodSchema] of entries) {
                            const schema = this.convertSchema(zodSchema);
                            parameters.push({
                                in: "path",
                                name,
                                description: undefined,
                                required: true,
                                schema: schema || { type: "string" },
                            });
                        }
                    } else if ("_def" in paramsObj) {
                        // It's a Zod schema itself
                        const paramSchema = this.convertSchema(paramsObj);
                        if (paramSchema?.properties) {
                            for (const [name, schema] of Object.entries(paramSchema.properties)) {
                                parameters.push({
                                    in: "path",
                                    name,
                                    description: undefined,
                                    required: paramSchema.required?.includes(name) ?? true,
                                    schema: schema as any,
                                });
                            }
                        }
                    }
                }
            }

            // Auto-generate query schemas from validation
            if (route.validation?.query && !route.openapi.request?.query) {
                const querySchema = this.convertSchema(route.validation.query);
                if (querySchema?.properties) {
                    for (const [name, schema] of Object.entries(querySchema.properties)) {
                        parameters.push({
                            in: "query",
                            name,
                            description: undefined,
                            required: querySchema.required?.includes(name) ?? false,
                            schema: schema as any,
                        });
                    }
                }
            }

            if (parameters.length > 0) {
                operation.parameters = parameters;
            }

            // Add responses from route definition first
            if (route.responses && route.responses.length > 0) {
                for (const response of route.responses) {
                    operation.responses[response.statusCode.toString()] = {
                        description: response.description,
                    };

                    if (response.schema) {
                        operation.responses[response.statusCode.toString()].content = {
                            "application/json": {
                                schema: this.convertSchema(response.schema),
                            },
                        };
                    }
                }
            }

            // Add any additional responses from openapi config that aren't already defined
            if (route.openapi.responses) {
                for (const [status, response] of Object.entries(
                    route.openapi.responses,
                )) {
                    if (!operation.responses[status]) {
                        operation.responses[status] = {
                            description: response.description,
                        };

                        if (response.schema) {
                            operation.responses[status].content = {
                                "application/json": {
                                    schema: this.convertSchema(response.schema),
                                },
                            };
                        }

                        if (response.headers) {
                            operation.responses[status].headers = response.headers;
                        }
                    }
                }
            }

            paths[path][route.method] = operation;
        }

        return {
            openapi: "3.0.0",
            info: {
                title: config.title,
                version: config.version,
                description: config.description,
                contact: config.contact,
                license: config.license,
            },
            servers: config.servers,
            paths,
            externalDocs: config.externalDocs,
        };
    }

    private convertSchema(schema: any): any {
        // If it's already a plain object (JSON Schema), use it directly
        if (!schema?._def && typeof schema === "object") {
            return schema;
        }
        
        // If it's a Zod schema
        if (schema?._def) {
            // For ZodObject, we can extract the shape
            if (schema._def.type === "object" && schema.shape) {
                const properties: any = {};
                const required: string[] = [];
                
                for (const [key, value] of Object.entries(schema.shape)) {
                    // Recursively convert nested schemas
                    properties[key] = this.convertZodType(value as any);
                    
                    // Check if field is required
                    if (!(value as any).isOptional?.()) {
                        required.push(key);
                    }
                }
                
                return {
                    type: "object",
                    properties,
                    ...(required.length > 0 ? { required } : {}),
                };
            }
            
            // For other Zod types, try to convert them
            return this.convertZodType(schema);
        }
        
        return schema;
    }
    
    private convertZodType(zodSchema: any): any {
        if (!zodSchema?._def) {
            return { type: "string" }; // Default fallback
        }
        
        // Use _def.type for type detection instead of typeName
        const type = zodSchema._def.type;
        
        switch (type) {
            case "string": {
                const stringSchema: any = { type: "string" };
                if (zodSchema._def.checks) {
                    for (const check of zodSchema._def.checks) {
                        if (check.kind === "min") stringSchema.minLength = check.value;
                        if (check.kind === "max") stringSchema.maxLength = check.value;
                    }
                }
                return stringSchema;
            }
                
            case "number": {
                const numberSchema: any = { type: "number" };
                if (zodSchema._def.checks) {
                    for (const check of zodSchema._def.checks) {
                        if (check.kind === "min") numberSchema.minimum = check.value;
                        if (check.kind === "max") numberSchema.maximum = check.value;
                        if (check.kind === "int") numberSchema.type = "integer";
                    }
                }
                return numberSchema;
            }
                
            case "boolean":
                return { type: "boolean" };
                
            case "array": {
                // For arrays, we need to convert the element type
                const elementType = zodSchema._def.element || zodSchema.element;
                return {
                    type: "array",
                    items: elementType ? this.convertSchema(elementType) : { type: "string" },
                };
            }
                
            case "nullable": {
                const innerType = this.convertZodType(zodSchema._def.innerType);
                innerType.nullable = true;
                return innerType;
            }
                
            case "optional":
                return this.convertZodType(zodSchema._def.innerType);
                
            case "date":
                return { type: "string", format: "date-time" };
                
            case "enum":
                return {
                    type: "string",
                    enum: zodSchema._def.values,
                };
                
            case "object":
                return this.convertSchema(zodSchema);
                
            default:
                return { type: "string" };
        }
    }

    private cleanupSchema(schema: any): any {
        if (!schema || typeof schema !== "object") {
            return schema;
        }

        // Handle nullable types - convert anyOf with null to nullable
        if (
            schema.anyOf &&
            Array.isArray(schema.anyOf) &&
            schema.anyOf.length === 2
        ) {
            const hasNull = schema.anyOf.some((s: any) => s.type === "null");
            const nonNullSchema = schema.anyOf.find((s: any) => s.type !== "null");

            if (hasNull && nonNullSchema) {
                // Convert to OpenAPI 3.0 nullable format
                const cleaned = this.cleanupSchema(nonNullSchema);
                cleaned.nullable = true;
                return cleaned;
            }
        }

        // Create a new object to avoid mutating the original
        const cleaned: any = {};

        for (const [key, value] of Object.entries(schema)) {
            // Remove $schema property (not allowed in OpenAPI)
            if (key === "$schema") {
                continue;
            }

            // Fix exclusiveMinimum/exclusiveMaximum for OpenAPI 3.0
            if (key === "exclusiveMinimum" && typeof value === "number") {
                cleaned.minimum = value;
                cleaned.exclusiveMinimum = true;
                continue;
            }
            if (key === "exclusiveMaximum" && typeof value === "number") {
                cleaned.maximum = value;
                cleaned.exclusiveMaximum = true;
                continue;
            }

            // Remove additionalProperties if false (can cause issues with some tools)
            if (key === "additionalProperties" && value === false) {
                continue;
            }

            // Recursively clean nested schemas
            if (key === "properties" && typeof value === "object" && value !== null) {
                cleaned[key] = {};
                for (const [propKey, propValue] of Object.entries(value)) {
                    cleaned[key][propKey] = this.cleanupSchema(propValue);
                }
            } else if (key === "items") {
                cleaned[key] = this.cleanupSchema(value);
            } else if (key === "oneOf" || key === "anyOf" || key === "allOf") {
                cleaned[key] = (value as any[]).map((v) => this.cleanupSchema(v));
            } else {
                cleaned[key] = value;
            }
        }

        return cleaned;
    }
}