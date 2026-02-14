import { WorkflowContext } from './workflow.context';
import { WorkflowStep } from './workflow.step';
import { WorkflowEngine } from './workflow.engine';

/**
 * Helper to build workflows declaratively
 */
export class WorkflowBuilder<TContext extends WorkflowContext> {
    private steps: WorkflowStep<TContext>[] = [];

    /**
     * Add a step to the workflow
     */
    public add(step: WorkflowStep<TContext>): WorkflowBuilder<TContext> {
        this.steps.push(step);
        return this;
    }

    /**
     * Build the engine instance
     */
    public build(context: TContext): WorkflowEngine<TContext> {
        return new WorkflowEngine(this.steps, context);
    }
}
