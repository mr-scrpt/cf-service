import { Conversation } from '@grammyjs/conversations';
import { Context } from 'grammy';
import { DnsGatewayPort } from '@cloudflare-bot/shared';
import { WorkflowBuilder } from '../core/workflow.builder';
import { EditDnsWorkflowContext } from './edit-dns.workflow.context';

// Steps
import { SelectZoneWorkflowStep } from './steps/workflow/select-zone.workflow.step';
import { SelectRecordWorkflowStep } from './steps/workflow/select-record.workflow.step';
import { EditMenuWorkflowStep } from './steps/workflow/edit-menu.workflow.step';
import { EditNameWorkflowStep } from './steps/workflow/edit-name.workflow.step';
import { EditContentWorkflowStep } from './steps/workflow/edit-content.workflow.step';
import { EditTtlWorkflowStep } from './steps/workflow/edit-ttl.workflow.step';
import { EditProxiedWorkflowStep } from './steps/workflow/edit-proxied.workflow.step';
import { EditGenericFieldWorkflowStep } from './steps/workflow/edit-generic-field.workflow.step';
import { SaveRecordWorkflowStep } from './steps/workflow/save-record.workflow.step';

export function editDnsWorkflowFactory(gateway: DnsGatewayPort) {
    return async function editDnsWorkflow(conversation: Conversation<any>, ctx: Context) {
        const context = new EditDnsWorkflowContext();

        const engine = new WorkflowBuilder<EditDnsWorkflowContext>()
            .add(new SelectZoneWorkflowStep(gateway))
            .add(new SelectRecordWorkflowStep(gateway))
            .add(new EditMenuWorkflowStep())
            // Route targets for the menu
            .add(new EditNameWorkflowStep())
            .add(new EditContentWorkflowStep())
            .add(new EditTtlWorkflowStep())
            .add(new EditProxiedWorkflowStep())
            .add(new EditGenericFieldWorkflowStep()) // Handles Priority, Weight, Port, Target, etc.
            .add(new SaveRecordWorkflowStep(gateway))
            .build(context);

        await engine.run(conversation, ctx);
    };
}
