import { Message } from "discord.js";
import {StopCommand, ActivitycheckCommand, AvatarCommand, CreateRoleCommand, BanCommand, SayCommand, DeleteChannelCommand, AddRoleCommand, EditRoleCommand, CleanCommand, DemoteCommand, RemoveRoleCommand, HelpCommand, GetPassCommand, KickCommand, RoleInfoCommand, ServerInfoCommand, ResetAllRolesCommand, UserInfoCommand, SnipeCommand, EditSnipeCommand, UnbanCommand, CallCommand, LangCommand, InfoCommand, FocusBanCommand, FormatCommand, CodeCommand, CancelCommand, FocusKickCommand, CreateChannelCommand, DeleteDisCommand, ResetMemberCommand, RenameEveryoneCommand, MuteCommand, WhisperCommand, SetCommand, RAECommand, EditChannelCommand, WebhooksCommand, CreateWebhookCommand, CopyCommand } from "./commands";
import Command from "./commands/commandInterface";
import { CommandParser } from "./models/commandParser";
import ArgCommand from "./commands/commandArgInterface";
import { Lang } from "./commands/lang/Lang";
import { Connections } from "./config/connections";
import { RowDataPacket } from "mysql2";

export default class CommandHandler {

  static commands: Command[];
  static argCommands: ArgCommand[]
  prefix: string;

  constructor() {
    // Clases aquí
    const commandClasses = [
      StopCommand,
      ActivitycheckCommand,
      ServerInfoCommand,
      SnipeCommand,
      EditSnipeCommand,
      InfoCommand,
      CancelCommand,
      DeleteDisCommand,
      CreateWebhookCommand
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
      CodeCommand,
      UnbanCommand,
      FocusKickCommand,
      CreateChannelCommand,
      ResetMemberCommand,
      RenameEveryoneCommand,
      MuteCommand,
      WhisperCommand,
      SetCommand,
      RAECommand,
      EditChannelCommand,
      WebhooksCommand,
      CopyCommand
    ];

    CommandHandler.commands = commandClasses.map(c => new c());
    CommandHandler.argCommands = argCommandClasses.map(c=>new c())
    this.prefix = '!!';
  }

  /** Executes user commands contained in a message if appropriate. */
  async handleMessage(message: Message): Promise<void> {
    if (message.author.bot) return
    
    var lang: Lang
    if (message.guild === null) lang = new Lang(message,message.author.locale || undefined)
    else{
      lang = new Lang(message)
      const [rows, fields] = await Connections.db.execute<RowDataPacket[]>('SELECT prefix from guilds WHERE id=?', [message.guild.id])
      console.log(rows)
      if(rows[0].prefix) this.prefix = rows[0].prefix
      else Connections.db.query('INSERT INTO guilds VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE id=id;', [message.guild.id, message.guild.name, '!!', 'es']).then(()=>console.log('Servidor registrado: ' + message.guild!.id)).catch(e=>console.error(e));
    }
    if(!this.isCommand(message)) return
    
    const commandParser = new CommandParser(message, this.prefix);

    const matchedCommand = CommandHandler.commands.find(command => command.commandNames.includes(commandParser.parsedCommandName))
    const matchedArgCommand = CommandHandler.argCommands.find(command => command.commandNames.includes(commandParser.parsedCommandName))
    if(matchedCommand) {
      if (message.channel.type == "dm" && matchedCommand.guildExclusive) {
        lang.reply('errors.no_dms')
        return
      }
      await matchedCommand.run(message,lang).catch(error => {
        message.react('❌')
        lang.reply('errors.unknown')
        console.error(`"${this.echoMessage(message)}" falló por "${error}"`);
      });
    }
    if (matchedArgCommand) {
      if (message.channel.type == "dm" && matchedArgCommand.guildExclusive) {
        lang.reply('errors.no_dms')
        return
      }
      if (commandParser.args.length < matchedArgCommand.requiredArgs) {
        lang.reply('errors.not_enough_args',this.prefix,commandParser.parsedCommandName,await lang.translate(matchedArgCommand.usage))
        return
      }
      await matchedArgCommand.checkPermissions(message,lang, this.prefix).then(b=>{
       if(b) matchedArgCommand.run(message,lang,commandParser.args, this.prefix).catch(error => {
         message.react('❌')
         lang.reply('errors.unknown')
         console.error(`"${this.echoMessage(message)}" falló por "${error.stack}"`)
      })});
    }
    console.log(`Comando '${this.echoMessage(message)}' ejecutado por ${message.author.tag}`);
  }

  /** Sends back the message content after removing the prefix. */
  echoMessage(message: Message): string {
    return message.content.replace(this.prefix, "").trim();
  }

  /** Determines whether or not a message is a user command. */
  private isCommand(message: Message): boolean {
    const c = message.content
    return c.startsWith(this.prefix) || c.startsWith('<@685645806069612621> ') || c.startsWith('<@!685645806069612621> ');
  }
}
