import { Conversation } from '@grammyjs/conversations';
import { Context } from 'grammy';
import { IStepResult, JumpToStepResult } from '../../../core/step.result';
import { WorkflowStep } from '../../../core/workflow.step';
import { CreateDnsStep } from '../../config/create-dns.constants';
import { CreateDnsWorkflowContext } from '../../create-dns.workflow.context';
import { getFieldsForType, FIELD_DEFINITIONS } from '../../config/create-dns.config';
import { DnsRecordType } from '@cloudflare-bot/shared';
import { resolveDnsFieldValue } from '../../../shared/dns.utils';

export class InputWizardWorkflowStep implements WorkflowStep<CreateDnsWorkflowContext> {
    readonly id = CreateDnsStep.INPUT_WIZARD;

    async execute(
        conversation: Conversation<any>,
        ctx: Context,
        state: CreateDnsWorkflowContext,
    ): Promise<IStepResult> {
        if (!state.type) {
            throw new Error('Record type is missing');
        }

        const layout = getFieldsForType(state.type as DnsRecordType);
        const draft = state.getEffectiveRecord();

        for (const field of layout) {
            // Check if field has value
            const def = FIELD_DEFINITIONS[field];

            // Resolve value
            const val = resolveDnsFieldValue(draft, def, field);

            // Simple check for "is filled"
            // For boolean (proxied), false is a valid value, so check undefined/null.
            const isFilled = val !== undefined && val !== null && val !== '';

            if (!isFilled) {
                // Found the first missing field!
                state.setActiveField(field);
                // Jump to input step (reusing the existing one)
                return new JumpToStepResult(CreateDnsStep.CREATE_FIELD);
            }
        }

        // All fields filled! Proceed to Review.
        return new JumpToStepResult(CreateDnsStep.CREATE_REVIEW);
    }
}
