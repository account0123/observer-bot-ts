import { CommandInteraction } from "discord.js";
import ArgCommand from "./commandArgInterface";
import { InteractionLang } from "./lang/Lang";

export default interface SlashCommand extends ArgCommand {
    verify(interaction:CommandInteraction, l?: InteractionLang): Promise<boolean>
    interact(interaction:CommandInteraction, l: InteractionLang, prefix?: string): Promise<void>
}