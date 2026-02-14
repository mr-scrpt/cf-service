import { Conversation } from '@grammyjs/conversations';
import { Context } from 'grammy';
import { WorkflowContext } from './workflow.context';
import { IStepResult } from './step.result';

/**
 * Single unit of work in a workflow.
 * Must be stateless regarding flow control (delegates to Result).
 */
export interface WorkflowStep<TContext extends WorkflowContext> {
    /**
     * Unique identifier for jumping/referencing
     */
    readonly id: string;

    /**
     * Execute the step logic
     */
    execute(conversation: Conversation<any>, ctx: Context, context: TContext): Promise<IStepResult>;
}
