import { Message, MessageEmbed } from "discord.js";
import {StopCommand, AvatarCommand, CreateRoleCommand, BanCommand, SayCommand, AddRoleCommand, EditRoleCommand, CleanCommand, DemoteCommand, RemoveRoleCommand, HelpCommand, GetPassCommand, KickCommand, RoleInfoCommand, ServerInfoCommand, ResetAllRolesCommand, UserInfoCommand, SnipeCommand, EditSnipeCommand, UnbanCommand, LangCommand, InfoCommand, FocusBanCommand, FormatCommand, CodeCommand, CancelCommand, FocusKickCommand, CreateChannelCommand, DeleteDisCommand, ResetMemberCommand, RenameEveryoneCommand, SetCommand, EditChannelCommand, WebhooksCommand, CreateWebhookCommand, CopyCommand, DisableCommand, EnableCommand } from "./commands";
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
      LangCommand,
      FocusBanCommand,
      FormatCommand,
      CodeCommand,
      UnbanCommand,
      FocusKickCommand,
      CreateChannelCommand,
      ResetMemberCommand,
      RenameEveryoneCommand,
      SetCommand,
      EditChannelCommand,
      WebhooksCommand,
      CopyCommand,
      DisableCommand,
      EnableCommand
    ];

    CommandHandler.commands = commandClasses.map(c => new c());
    CommandHandler.argCommands = argCommandClasses.map(c=>new c())
    this.prefix = '!!';
  }

  /** Executes user commands contained in a message if appropriate. */
  async handleMessage(message: Message): Promise<void> {
    if(message.author.bot) return

    let lang: Lang
    if (message.guild === null) lang = new Lang(message,message.author.locale || undefined)
    else{
      lang = new Lang(message)
      const g = message.guild
      const [rows] = await Connections.db.execute<RowDataPacket[]>('SELECT prefix FROM guilds WHERE id=?', [g.id])
      if(rows[0].prefix) this.prefix = rows[0].prefix
      else Connections.db.query('INSERT INTO guilds VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE id=id;', [message.guild.id, message.guild.name, '!!', 'es']).then(()=>console.log('Servidor registrado: ' + g.id)).catch(e=>console.error(e));
    }
    if(!this.isCommand(message)) return

    const commandParser = new CommandParser(message, this.prefix);
    const matchedCommand = CommandHandler.commands.find(command => command.commandNames.includes(commandParser.parsedCommandName))
    const matchedArgCommand = CommandHandler.argCommands.find(command => command.commandNames.includes(commandParser.parsedCommandName))
    
    if(matchedCommand) {
      if(message.guild){
        const [rows] = await Connections.db.execute<RowDataPacket[]>('SELECT command FROM disabled WHERE guild_id=? AND channel_id=? OR global=?', [message.guild.id, message.channel.id, 1])
        for(const row of rows){
          if(row['command'] == matchedCommand.commandNames[0]){
            lang.send('disabled')
            return
          }
        }
      }
      if (message.channel.type == "dm" && matchedCommand.guildExclusive) {
        lang.reply('errors.no_dms')
        return
      }
      await matchedCommand.run(message,lang).catch(error => {
        message.react('❌')
        lang.reply('errors.unknown')
        console.error(`"${this.echoMessage(message)}" falló por "${error}"`)
      });
    }else if (matchedArgCommand) {
      if(message.guild){
        const [rows] = await Connections.db.execute<RowDataPacket[]>('SELECT command FROM disabled WHERE guild_id=? AND channel_id=? OR global=?', [message.guild.id, message.channel.id, 1])
        console.log(rows)
        for(const row of rows){
          if(row['command'] == matchedArgCommand.commandNames[0]){
            lang.send('disabled')
            return
          }
        }
      }
      if (message.channel.type == "dm" && matchedArgCommand.guildExclusive) {
        lang.reply('errors.no_dms')
        return
      }
      if (commandParser.args.length < matchedArgCommand.requiredArgs) {
        message.react('❌').catch()
        const t = await lang.translate('errors.not_enough_args')
        const n = matchedArgCommand.commandNames[0]
        const u = `${this.prefix}${n} \`${await lang.translate(matchedArgCommand.usage)}\``
        const e = new MessageEmbed().addField(await lang.translate('info.help.about.usage'), u)
        e.addField(await lang.translate('info.help.about.examples'), matchedArgCommand.examples.map(e=>`${this.prefix}${n} ${e}`))
        message.channel.send(t, {embed: e})
        return
      }
      await matchedArgCommand.checkPermissions(message,lang, this.prefix).then(b=>{
       if(b) matchedArgCommand.run(message,lang,commandParser.args, this.prefix).catch(error => {
         message.react('❌').catch()
         lang.reply('errors.unknown')
         console.error(`"${this.echoMessage(message)}" falló por "${error.stack}"`)
      })});
    }else return
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
