import { WorkflowBuilder } from '../core/workflow.builder';
import { EditDnsWorkflowContext } from './edit-dns.workflow.context';
import { SelectZoneWorkflowStep } from './steps/select-zone.step';
import { SelectRecordWorkflowStep } from './steps/select-record.step';
import { EditMenuWorkflowStep } from './steps/edit-menu.step';
import { EditFieldWorkflowStep } from './steps/edit-field.step';
import { SaveRecordWorkflowStep } from './steps/save-record.step';
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
