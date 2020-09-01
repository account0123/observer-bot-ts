import { Message } from "discord.js";
import {StopCommand, ActivitycheckCommand, AvatarCommand, CreateRoleCommand, BanCommand, SayCommand, DeleteChannelCommand, AddRoleCommand, EditRoleCommand, CleanCommand, DemoteCommand, RemoveRoleCommand, HelpCommand, GetPassCommand, KickCommand, RoleInfoCommand, ServerInfoCommand, ResetAllRolesCommand, UserInfoCommand, SnipeCommand, EditSnipeCommand, UnbanEveryoneCommand } from "./commands";
import Command from "./commands/commandInterface";
import { CommandParser } from "./models/commandParser";
import ArgCommand from "./commands/commandArgInterface";
import { Lang } from "./commands/lang/Lang";

export default class CommandHandler {

  static commands: Command[];
  static argCommands: ArgCommand[]

  static prefix: string;

  constructor(prefix: string) {
    // Clases aquí
    const commandClasses = [
      StopCommand,
      ActivitycheckCommand,
      ServerInfoCommand,
      SnipeCommand,
      EditSnipeCommand,
      UnbanEveryoneCommand
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
      HelpCommand,
      GetPassCommand,
      KickCommand,
      RoleInfoCommand,
      ResetAllRolesCommand,
      UserInfoCommand
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
    var lang: Lang
    if (message.guild) lang = new Lang(message.guild.id)
    else lang = new Lang(message.author.locale)
    if(matchedCommand) {
      if (message.channel.type == "dm" && matchedCommand.guildExclusive) {
        lang.reply('errors.no_dms', message)
        return
      }
      await matchedCommand.run(message).catch(error => {
        console.error(`"${this.echoMessage(message)}" falló por "${error}"`);
      });
    }
    if (matchedArgCommand) {
      if (message.channel.type == "dm" && matchedArgCommand.guildExclusive) {
        lang.reply('errors.no_dms', message)
        return
      }
      if (commandParser.args.length < matchedArgCommand.requiredArgs) {
        lang.reply('errors.not_enough_args',message,CommandHandler.prefix,commandParser.parsedCommandName,matchedArgCommand.usage)
        return
      }
      await matchedArgCommand.checkPermissions(message).then(b=>{
       if(b) matchedArgCommand.run(message,commandParser.args).catch(error => {
         lang.send('errors.unknown', message)
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
    return message.content.startsWith(CommandHandler.prefix || '<@685645806069612621> ' || '<@!685645806069612621> ');
  }
}
