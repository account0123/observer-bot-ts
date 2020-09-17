import { Message } from "discord.js";
import {StopCommand, ActivitycheckCommand, AvatarCommand, CreateRoleCommand, BanCommand, SayCommand, DeleteChannelCommand, AddRoleCommand, EditRoleCommand, CleanCommand, DemoteCommand, RemoveRoleCommand, HelpCommand, GetPassCommand, KickCommand, RoleInfoCommand, ServerInfoCommand, ResetAllRolesCommand, UserInfoCommand, SnipeCommand, EditSnipeCommand, UnbanCommand, CallCommand, LangCommand, InfoCommand, FocusBanCommand, FormatCommand, CodeCommand } from "./commands";
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
      InfoCommand
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
      UserInfoCommand,
      CallCommand,
      LangCommand,
      FocusBanCommand,
      FormatCommand,
      CodeCommand
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
    if (message.guild) lang = new Lang(message)
    else lang = new Lang(message,message.author.locale)
    if(matchedCommand) {
      if (message.channel.type == "dm" && matchedCommand.guildExclusive) {
        lang.reply('errors.no_dms')
        return
      }
      await matchedCommand.run(message,lang).catch(error => {
        console.error(`"${this.echoMessage(message)}" falló por "${error}"`);
      });
    }
    if (matchedArgCommand) {
      if (message.channel.type == "dm" && matchedArgCommand.guildExclusive) {
        lang.reply('errors.no_dms')
        return
      }
      if (commandParser.args.length < matchedArgCommand.requiredArgs) {
        lang.reply('errors.not_enough_args',CommandHandler.prefix,commandParser.parsedCommandName,await lang.translate(matchedArgCommand.usage))
        return
      }
      await matchedArgCommand.checkPermissions(message,lang).then(b=>{
       if(b) matchedArgCommand.run(message,lang,commandParser.args).catch(error => {
         lang.reply('errors.unknown')
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
    const c = message.content
    return c.startsWith(CommandHandler.prefix) || c.startsWith('<@685645806069612621> ') || c.startsWith('<@!685645806069612621> ');
  }
}
