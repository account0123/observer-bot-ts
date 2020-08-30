import { Message } from "discord.js";
import {StopCommand, ActivitycheckCommand, AvatarCommand, CreateRoleCommand, BanCommand, SayCommand, DeleteChannelCommand, AddRoleCommand, EditRoleCommand, CleanCommand, DemoteCommand, RemoveRoleCommand, HelpCommand } from "./commands";
import Command from "./commands/commandInterface";
import { CommandParser } from "./models/commandParser";
import ArgCommand from "./commands/commandArgInterface";

export default class CommandHandler {

  static commands: Command[];
  static argCommands: ArgCommand[]

  static prefix: string;

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
      SayCommand,
      DeleteChannelCommand,
      EditRoleCommand,
      AddRoleCommand,
      CleanCommand,
      DemoteCommand,
      RemoveRoleCommand,
      HelpCommand
    ];

    CommandHandler.commands = commandClasses.map(commandClass => new commandClass());
    CommandHandler.argCommands = argCommandClasses.map(c=>new c())
    CommandHandler.prefix = prefix;
  }

  /** Executes user commands contained in a message if appropriate. */
  async handleMessage(message: Message): Promise<void> {
    if (message.author.bot || !this.isCommand(message)) {
      return;
    }

    console.log(`Comando '${this.echoMessage(message)}' ejecutado por ${message.author.tag}`);

    const commandParser = new CommandParser(message, CommandHandler.prefix);

    const matchedCommand = CommandHandler.commands.find(command => command.commandNames.includes(commandParser.parsedCommandName))
    const matchedArgCommand = CommandHandler.argCommands.find(command => command.commandNames.includes(commandParser.parsedCommandName))

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
        message.reply(`no pude hacer nada por falta de argumentos. El uso correcto del comando sería \`${CommandHandler.prefix}${commandParser.parsedCommandName} ${matchedArgCommand.usage}\``);
        return
      }
      await matchedArgCommand.checkPermissions(message).then(b=>{
       if(b) matchedArgCommand.run(message,commandParser.args).catch(error => {
         message.channel.send('Ocurrió un rror inesperado :thinking: ¿?')
         console.error(`"${this.echoMessage(message)}" falló por "${error.stack}"`)
      })});
    }
  }

  /** Sends back the message content after removing the prefix. */
  echoMessage(message: Message): string {
    return message.content.replace(CommandHandler.prefix, "").trim();
  }

  /** Determines whether or not a message is a user command. */
  private isCommand(message: Message): boolean {
    return message.content.startsWith(CommandHandler.prefix);
  }
}
