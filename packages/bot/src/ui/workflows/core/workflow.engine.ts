import { Conversation } from '@grammyjs/conversations';
import { Context } from 'grammy';
import { WorkflowContext } from './workflow.context';
import { WorkflowStep } from './workflow.step';
import { IWorkflowEngine } from './workflow.engine.interface';
import { logger } from '../../../utils/logger';

export class WorkflowEngine<TContext extends WorkflowContext> implements IWorkflowEngine {
    private currentStepIndex = 0;
    private isRunning = false;

    constructor(
        private steps: WorkflowStep<TContext>[],
        private context: TContext
    ) { }

    public async run(conversation: Conversation<any>, ctx: Context) {
        this.isRunning = true;
        this.currentStepIndex = 0;

        logger.info('WorkflowEngine: Starting workflow', { steps: this.steps.map(s => s.id) });

        while (this.isRunning && this.currentStepIndex < this.steps.length) {
            const step = this.steps[this.currentStepIndex];

            logger.info(`WorkflowEngine: Executing step ${step.id}`);

            try {
                // Execute step
                const result = await step.execute(conversation, ctx, this.context);

                // Delegate flow control to the result (Polymorphism)
                await result.process(this);
            } catch (error) {
                logger.error(`WorkflowEngine: Error in step ${step.id}`, { error });
                // Default error handling: Stop? Or define ErrorResult?
                // For now, rethrow or stop.
                this.stop();
                throw error;
            }
        }

        logger.info('WorkflowEngine: Workflow finished');
    }

    // Public API for Results to control the Engine

    /**
     * Move to next step
     */
    public advance() {
        this.currentStepIndex++;
    }

    /**
     * Jump to a specific step by ID
     */
    public jumpTo(id: string) {
        const index = this.steps.findIndex(s => s.id === id);
        if (index === -1) {
            logger.error(`WorkflowEngine: Target step ${id} not found`);
            // Safety: Stop or just advance? 
            // Better to stop to avoid infinite loops or unpredictable state.
            this.stop();
            return;
        }
        this.currentStepIndex = index;
    }

    /**
     * Stop the workflow
     */
    public stop() {
        this.isRunning = false;
    }
}
