/**
 * Interface for Workflow Engine to break circular dependencies with StepResult
 */
export interface IWorkflowEngine {
    /**
     * Move to next step
     */
    advance(): void;

    /**
     * Jump to a specific step by ID
     */
    jumpTo(id: string): void;

    /**
     * Stop the workflow
     */
    stop(): void;
}
