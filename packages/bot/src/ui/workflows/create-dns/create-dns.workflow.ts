import { DnsGatewayPort } from '@cloudflare-bot/shared';
import { WorkflowBuilder } from '../core/workflow.builder';
import { CreateDnsWorkflowContext } from './create-dns.workflow.context';
import { RECORD_TYPE_LAYOUTS } from './config/create-dns.config';

// Steps
import { SelectZoneWorkflowStep } from './steps/selection/select-zone.step';
import { SelectTypeWorkflowStep } from './steps/selection/select-type.step';
import { CreateMenuWorkflowStep } from './steps/editor/create-menu.step';
import { CreateFieldWorkflowStep } from './steps/editor/create-field.step';
import { CreateRecordWorkflowStep } from './steps/execution/create-record.step';

export function createDnsWorkflowFactory(gateway: DnsGatewayPort) {
    const context = new CreateDnsWorkflowContext();

    // MENU-DRIVEN Workflow (Mirrors Edit DNS):
    // Select Zone -> Select Type -> Menu <-> Field -> Create
    const builder = new WorkflowBuilder<CreateDnsWorkflowContext>()
        .add(new SelectZoneWorkflowStep(gateway))
        .add(new SelectTypeWorkflowStep())
        .add(new CreateMenuWorkflowStep())
        .add(new CreateFieldWorkflowStep())
        .add(new CreateRecordWorkflowStep(gateway));

    const engine = builder.build(context);
    return engine.run.bind(engine);
}
