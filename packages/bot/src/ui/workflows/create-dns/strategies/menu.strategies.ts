import { Context } from 'grammy';
import { CreateDnsWorkflowContext } from '../create-dns.workflow.context';
import { CreateDnsStep, CreateDnsAction } from '../config/create-dns.constants';
import { IStepResult, JumpToStepResult, ExitFlowResult, NextStepResult } from '../../core/step.result';
import { CallbackSerializer, DnsEditFieldPayload } from '../../../callbacks/callback-data';
import { MenuCallbacks } from '../../../menus/main.menu';

export interface MenuActionStrategy {
    handle(ctx: Context, state: CreateDnsWorkflowContext, data: string): Promise<IStepResult | null>;
}

export class EditFieldActionStrategy implements MenuActionStrategy {
    async handle(ctx: Context, state: CreateDnsWorkflowContext, data: string): Promise<IStepResult | null> {
        const { payload } = CallbackSerializer.deserialize<DnsEditFieldPayload>(data);
        state.setActiveField(payload.field);
        return new JumpToStepResult(CreateDnsStep.CREATE_FIELD);
    }
}

export class CreateRecordActionStrategy implements MenuActionStrategy {
    async handle(ctx: Context, state: CreateDnsWorkflowContext, data: string): Promise<IStepResult | null> {
        return new JumpToStepResult(CreateDnsStep.CREATE_RECORD);
    }
}

export class CancelActionStrategy implements MenuActionStrategy {
    async handle(ctx: Context, state: CreateDnsWorkflowContext, data: string): Promise<IStepResult | null> {
        await ctx.reply('❌ Creation cancelled.', {
            reply_markup: { inline_keyboard: [[{ text: '🔙 Back to Menu', callback_data: MenuCallbacks.dns }]] }
        });
        return new ExitFlowResult();
    }
}

export const MENU_ACTION_STRATEGIES: Record<string, MenuActionStrategy> = {
    [CreateDnsAction.SET]: new EditFieldActionStrategy(), // 'set' action used by dnsEditField callback
    [CreateDnsAction.CREATE]: new CreateRecordActionStrategy(), // 'save' action (if we reuse dnsSaveRecord) OR new 'create' action?
    // Wait, if we use `Callback.dnsSaveRecord()` it emits type 'dns_save' and payload action 'save'.
    // We should probably define a `Callback.dnsCreateRecord()` or reuse save. 
    // If we reuse save, we need to handle 'save' action here.
    [CreateDnsAction.CANCEL]: new CancelActionStrategy()
};
