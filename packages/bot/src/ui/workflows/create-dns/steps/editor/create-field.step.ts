import { Conversation } from '@grammyjs/conversations';
import { Context } from 'grammy';
import { WorkflowStep } from '../../../core/workflow.step';
import { IStepResult, JumpToStepResult } from '../../../core/step.result';
import { CreateDnsWorkflowContext } from '../../create-dns.workflow.context';
import { FIELD_DEFINITIONS } from '../../config/create-dns.config';
import { INPUT_STRATEGIES } from '../../strategies/input.strategies';
import { CreateDnsStep, DnsFieldName } from '../../config/create-dns.constants';
import { resolveDnsFieldValue } from '../../../shared/dns.utils';

export class CreateFieldWorkflowStep implements WorkflowStep<CreateDnsWorkflowContext> {
    readonly id = CreateDnsStep.CREATE_FIELD;

    async execute(
        conversation: Conversation<any>,
        ctx: Context,
        state: CreateDnsWorkflowContext,
    ): Promise<IStepResult> {
        const fieldName = state.getActiveField();
        if (!fieldName) {
            // Should not happen if flow is correct
            return new JumpToStepResult(CreateDnsStep.INPUT_WIZARD);
        }

        const fieldDef = FIELD_DEFINITIONS[fieldName as DnsFieldName];
        if (!fieldDef) {
            throw new Error(`Field definition not found for ${fieldName}`);
        }

        const strategy = INPUT_STRATEGIES[fieldDef.input.type];
        if (!strategy) {
            throw new Error(`No strategy found for input type ${fieldDef.input.type}`);
        }

        // Get current value from draft to show in prompt
        const currentVal = resolveDnsFieldValue(state.getEffectiveRecord(), fieldDef, fieldName);

        await strategy.handle(conversation, ctx, state, fieldDef, currentVal);

        // Return to wizard to check for next field
        return new JumpToStepResult(CreateDnsStep.INPUT_WIZARD);
    }
}
