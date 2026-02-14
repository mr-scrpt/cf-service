/**
 * Universal Workflow Context
 * A pure state container that decouples domain logic from the engine.
 */
export class WorkflowContext {
    private storage = new Map<string, any>();

    /**
     * Set a value in the context
     */
    public set<T>(key: string, value: T): void {
        this.storage.set(key, value);
    }

    /**
     * Get a value from the context
     */
    public get<T>(key: string): T | undefined {
        return this.storage.get(key) as T;
    }

    /**
     * Check if a key exists
     */
    public has(key: string): boolean {
        return this.storage.has(key);
    }

    /**
     * Clear all state
     */
    public clear(): void {
        this.storage.clear();
    }
}
