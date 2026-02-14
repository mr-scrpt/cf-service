/**
 * StepResult - The Command Pattern for Workflow Navigation
 * Decouples the "What" (Business Logic) from the "How" (Flow Control).
 */

import { IWorkflowEngine } from './workflow.engine.interface';

export interface IStepResult {
    process(engine: IWorkflowEngine): Promise<void>;
}

/**
 * Advance to the next step in the list
 */
export class NextStepResult implements IStepResult {
    async process(engine: IWorkflowEngine) {
        engine.advance();
    }
}

/**
 * Jump to a specific step by ID
 */
export class JumpToStepResult implements IStepResult {
    constructor(private readonly stepId: string) { }

    async process(engine: IWorkflowEngine) {
        engine.jumpTo(this.stepId);
    }
}

/**
 * Exit the workflow immediately
 */
export class ExitFlowResult implements IStepResult {
    async process(engine: IWorkflowEngine) {
        engine.stop();
    }
}

/**
 * Repeat the current step (effectively a jump to self, but semantic)
 */
export class RepeatStepResult implements IStepResult {
    async process(engine: IWorkflowEngine) {
        // No-op creates a repeat effect if engine doesn't auto-advance
    }
}
