import { Context, InlineKeyboard } from 'grammy';
import { IStepResult, JumpToStepResult, ExitFlowResult } from '../../core/step.result';
import { EditDnsWorkflowContext } from '../edit-dns.workflow.context';
import { CallbackPattern, CallbackSerializer, DnsEditFieldPayload, DnsSaveRecordPayload } from '../../../callbacks/callback-data';
import { EditDnsStep, EditDnsAction, DnsFieldName } from '../edit-dns.constants';
import { FIELD_DEFINITIONS } from '../edit-dns.config';
import { MenuCallbacks } from '../../../menus/main.menu';

export interface MenuActionStrategy {
    matches(data: string): boolean;
    handle(ctx: Context, state: EditDnsWorkflowContext, data: string): Promise<IStepResult | null>;
}

export class EditFieldActionStrategy implements MenuActionStrategy {
    matches(data: string): boolean {
        return CallbackPattern.dnsEditField().test(data);
    }

    async handle(ctx: Context, state: EditDnsWorkflowContext, data: string): Promise<IStepResult | null> {
        const payload = CallbackSerializer.deserialize<DnsEditFieldPayload>(data);
        const field = payload.payload.field as DnsFieldName;

        if (FIELD_DEFINITIONS[field]) {
            state.setActiveField(field);
            return new JumpToStepResult(EditDnsStep.EDIT_FIELD);
        }
        return null;
    }
}

export class SaveRecordActionStrategy implements MenuActionStrategy {
    private handlers: Record<string, (ctx: Context, state: EditDnsWorkflowContext) => Promise<IStepResult>> = {
        [EditDnsAction.SAVE]: async () => {
            return new JumpToStepResult(EditDnsStep.SAVE_CHANGES);
        },
        [EditDnsAction.CANCEL]: async (ctx) => {
            await ctx.reply('❌ Edit cancelled.', {
                reply_markup: new InlineKeyboard().text('🔙 Back to Menu', MenuCallbacks.dns)
            });
            return new ExitFlowResult();
        }
    };

    matches(data: string): boolean {
        return CallbackPattern.dnsSaveRecord().test(data);
    }

    async handle(ctx: Context, state: EditDnsWorkflowContext, data: string): Promise<IStepResult | null> {
        const payload = CallbackSerializer.deserialize<DnsSaveRecordPayload>(data);
        const action = payload.payload.action;

        const handler = this.handlers[action];
        if (handler) {
            return handler(ctx, state);
        }

        return null;
    }
}

export const MENU_ACTION_STRATEGIES: MenuActionStrategy[] = [
    new EditFieldActionStrategy(),
    new SaveRecordActionStrategy()
];
