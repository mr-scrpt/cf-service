/**
 * Resolves a value from a record object based on a field definition.
 * Supports nested paths (e.g., 'data.priority') via the 'path' property in the definition.
 * 
 * @param record The source record object (draft or existing record)
 * @param fieldDef The field definition containing the 'path' configuration
 * @param fieldName The fallback field name if no path is specified
 * @returns The resolved value or undefined
 */
export function resolveDnsFieldValue(record: any, fieldDef: { path?: string[] }, fieldName: string): unknown {
    if (!record) return undefined;

    if (fieldDef.path && fieldDef.path.length > 0) {
        let val = record;
        for (const p of fieldDef.path) {
            if (val === undefined || val === null) return undefined;
            val = val[p];
        }
        return val;
    }

    return record[fieldName];
}
