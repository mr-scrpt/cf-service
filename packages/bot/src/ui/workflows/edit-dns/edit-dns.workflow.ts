import { WorkflowBuilder } from '../core/workflow.builder';
import { EditDnsWorkflowContext } from './edit-dns.workflow.context';
import { SelectZoneWorkflowStep } from './steps/workflow/select-zone.workflow.step';
import { SelectRecordWorkflowStep } from './steps/workflow/select-record.workflow.step';
import { EditMenuWorkflowStep } from './steps/workflow/edit-menu.workflow.step';
import { EditFieldWorkflowStep } from './steps/workflow/edit-field.workflow.step';
import { SaveRecordWorkflowStep } from './steps/workflow/save-record.workflow.step';
import { DnsGatewayPort } from '@cloudflare-bot/shared';

export function editDnsWorkflowFactory(gateway: DnsGatewayPort) {
    const context = new EditDnsWorkflowContext();

    // Linear Workflow:
    // Select Zone -> Select Record -> Menu <-> Field -> Save
    const builder = new WorkflowBuilder<EditDnsWorkflowContext>()
        .add(new SelectZoneWorkflowStep(gateway))
        .add(new SelectRecordWorkflowStep(gateway))
        .add(new EditMenuWorkflowStep())
        .add(new EditFieldWorkflowStep())
        .add(new SaveRecordWorkflowStep(gateway));

    const engine = builder.build(context);
    return engine.run.bind(engine);
}
