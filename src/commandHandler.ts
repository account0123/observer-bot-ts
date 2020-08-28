import { Message } from "discord.js";
import {StopCommand, ActivitycheckCommand, AvatarCommand, CreateRoleCommand, BanCommand, SayCommand } from "./commands";
import Command from "./commands/commandInterface";
import { CommandParser } from "./models/commandParser";
import ArgCommand from "./commands/commandArgInterface";

export default class CommandHandler {

  private commands: Command[];
  private argCommands: ArgCommand[]

  private readonly prefix: string;

  constructor(prefix: string) {
    // Clases aquí
    const commandClasses = [
      StopCommand,
      ActivitycheckCommand
    ];
    const argCommandClasses = [
      AvatarCommand,
      BanCommand,
      CreateRoleCommand,
      SayCommand
    ];

    this.commands = commandClasses.map(commandClass => new commandClass());
    this.argCommands = argCommandClasses.map(c=>new c())
    this.prefix = prefix;
  }

  /** Executes user commands contained in a message if appropriate. */
  async handleMessage(message: Message): Promise<void> {
    if (message.author.bot || !this.isCommand(message)) {
      return;
    }

    console.log(`Comando '${this.echoMessage(message)}' ejecutado por ${message.author.tag}`);

    const commandParser = new CommandParser(message, this.prefix);

    const matchedCommand = this.commands.find(command => command.commandNames.includes(commandParser.parsedCommandName))
    const matchedArgCommand = this.argCommands.find(command => command.commandNames.includes(commandParser.parsedCommandName))

    if(matchedCommand) {
      if (message.channel.type == "dm" && matchedCommand.guildExclusive) {
        message.reply(`este comando solo puede ejecutarse en servidores`)
        return
      }
      await matchedCommand.run(message).catch(error => {
        console.error(`"${this.echoMessage(message)}" falló por "${error}"`);
      });
    }
    if (matchedArgCommand) {
      if (message.channel.type == "dm" && matchedArgCommand.guildExclusive) {
        message.reply(`este comando solo puede ejecutarse en servidores`)
        return
      }
      if (commandParser.args.length < matchedArgCommand.requiredArgs) {
        message.reply(`no pude hacer nada por falta de argumentos. El uso correcto del comando sería \`${this.prefix}${commandParser.parsedCommandName} ${matchedArgCommand.usage}\``);
        return
      }
      await matchedArgCommand.run(message,commandParser.args).catch(error => {
        console.error(`"${this.echoMessage(message)}" falló por "${error}"`);
      });
    }
  }

  /** Sends back the message content after removing the prefix. */
  echoMessage(message: Message): string {
    return message.content.replace(this.prefix, "").trim();
  }

  /** Determines whether or not a message is a user command. */
  private isCommand(message: Message): boolean {
    return message.content.startsWith(this.prefix);
  }
}
