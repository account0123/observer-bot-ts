/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import Command from "./commandInterface"
import { Message } from "discord.js"

export class CommandName implements Command {
	commandNames: string[] = ['']
	guildExclusive = true
	shortdescription = 'info.set.description'
	fulldescription = ''
	usage = 'info.set.usage'
	examples: string[] = ['']
	permission = ''
  type = ''
  async run(message: Message): Promise<void> {
    
  }
}