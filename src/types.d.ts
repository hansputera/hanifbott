import type { Context, NarrowedContext } from "telegraf";
import { Message, Update } from "typegram";

export type CTX = NarrowedContext<Context, Update> & {
    message: Message.TextMessage
};
export interface ICategory
{
    name: string;
    hidden: boolean;
    commands: ICommand[];
}

export interface ICommand
{
    name: string;
    description: string;
    aliases: string[];
    ownerOnly: boolean;
    cooldown?: number;
    groupOnly?: boolean;
    execute(ctx: CTX, args: string[]): any | Promise<any>;
}
