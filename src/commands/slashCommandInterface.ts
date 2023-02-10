import { ChatInputCommandInteraction } from "discord.js";
import ArgCommand from "./commandArgInterface";
import { InteractionLang } from "./lang/Lang";

export default interface SlashCommand extends ArgCommand {
    verify(interaction:ChatInputCommandInteraction, l: InteractionLang): Promise<boolean>
    interact(interaction:ChatInputCommandInteraction, l: InteractionLang, prefix?: string): Promise<void>
}