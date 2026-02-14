import { DnsGatewayPort } from '@cloudflare-bot/shared';
import { WorkflowBuilder } from '../core/workflow.builder';
import { CreateDnsWorkflowContext } from './create-dns.workflow.context';
import { RECORD_TYPE_LAYOUTS } from './config/create-dns.config';

// Steps
import { SelectZoneWorkflowStep } from './steps/selection/select-zone.step';
import { SelectTypeWorkflowStep } from './steps/selection/select-type.step';
import { InputWizardWorkflowStep } from './steps/logic/input-wizard.step';
import { CreateFieldWorkflowStep } from './steps/editor/create-field.step';
import { ReviewWorkflowStep } from './steps/execution/review.step';
import { CreateRecordWorkflowStep } from './steps/execution/create-record.step';

export function createDnsWorkflowFactory(gateway: DnsGatewayPort) {
    return async (conversation: any, ctx: any) => {
        const context = new CreateDnsWorkflowContext();

        // WIZARD Workflow (Sequential):
        // Select Zone -> Select Type -> Wizard Loop (Determine Field <-> Input Field) -> Review -> Create
        const builder = new WorkflowBuilder<CreateDnsWorkflowContext>()
            .add(new SelectZoneWorkflowStep(gateway))
            .add(new SelectTypeWorkflowStep())
            .add(new InputWizardWorkflowStep())
            .add(new CreateFieldWorkflowStep())
            .add(new ReviewWorkflowStep())
            .add(new CreateRecordWorkflowStep(gateway));

        const engine = builder.build(context);
        await engine.run(conversation, ctx);
    };
}
