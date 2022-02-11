import { CommandInteraction } from "discord.js";
import ArgCommand from "./commandArgInterface";

export default interface SlashCommand extends ArgCommand {
    verify(interaction:CommandInteraction): Promise<boolean>
    interact(interaction:CommandInteraction): Promise<void>
}