import Command from "./commandInterface"
import { Message } from "discord.js"

export class CommandName implements Command {
  type: string | undefined
  shortdescription: string = ''
  fulldescription: string = ''
  guildExclusive: boolean = false
  commandNames = []

  help(): string {
    return ""
  }

  async run(message: Message): Promise<void> {
    
  }
}