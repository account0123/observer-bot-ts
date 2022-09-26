import { Interaction, Message, MessageEmbed, Snowflake } from "discord.js";
import {StopCommand, AvatarCommand, CreateRoleCommand, BanCommand, SayCommand, AddRoleCommand, EditRoleCommand, CleanCommand, DemoteCommand, RemoveRoleCommand, HelpCommand, GetPassCommand, KickCommand, RoleInfoCommand, ServerInfoCommand, ResetAllRolesCommand, UserInfoCommand, SnipeCommand, EditSnipeCommand, LangCommand, InfoCommand, FocusBanCommand, FormatCommand, CodeCommand, CancelCommand, FocusKickCommand, CreateChannelCommand, DeleteDisCommand, SetCommand, EditChannelCommand, CreateWebhookCommand, CopyCommand, DisableCommand, EnableCommand, WarnCommand, WarningsCommand, DefineCommand } from "./commands";
import Command from "./commands/commandInterface";
import { CommandParser } from "./models/commandParser";
import ArgCommand from "./commands/commandArgInterface";
import { InteractionLang, Lang } from "./commands/lang/Lang";
import { Connections } from "./config/connections";
import { RowDataPacket } from "mysql2";
import SlashCommand from "./commands/slashCommandInterface";

export default class CommandHandler {

  static commands: Command[];
  static argCommands: ArgCommand[]
  static slashes: SlashCommand[]
  prefix: string;
  private uses = new Map<Snowflake, number>()

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
      FocusKickCommand,
      CreateChannelCommand,
      SetCommand,
      EditChannelCommand,
      CopyCommand,
      DisableCommand,
      EnableCommand,
      WarnCommand,
      WarningsCommand,
      DefineCommand
    ];
    const slashCommands = [
      AddRoleCommand,
      DefineCommand,
      SayCommand,
      HelpCommand,
      CreateRoleCommand
    ];
    CommandHandler.commands = commandClasses.map(c => new c());
    CommandHandler.argCommands = argCommandClasses.map(c=>new c())
    CommandHandler.slashes = slashCommands.map(c => new c())
    this.prefix = '!!';
  }

  /** Executes user commands contained in a message if appropriate. */
  async handleMessage(message: Message): Promise<void> {
    if(message.author.bot) return

    let lang: Lang
    if (message.guild === null) lang = new Lang(message)
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
      const a = message.author.id
      if(this.uses.has(a)){
        const delta = Date.now() - (this.uses.get(a) || 0)
        if(delta < 3000){
          message.react('⏳').catch()
          return
        }else this.uses.delete(a)
      }else this.uses.set(a, Date.now())

      if (message.channel.type == "DM" && matchedCommand.guildExclusive) {
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

      const a = message.author.id
      if(this.uses.has(a)){
        const delta = Date.now() - (this.uses.get(a) || 0)
        if(delta < 3000){
          message.react('⏳').catch()
          return
        }else this.uses.delete(a)
      }else this.uses.set(a, Date.now())
      
      if (message.channel.type == "DM" && matchedArgCommand.guildExclusive) {
        lang.reply('errors.no_dms')
        return
      }
      if (commandParser.args.length < matchedArgCommand.requiredArgs) {
        message.react('❌').catch()
        const t = await lang.translate('errors.not_enough_args')
        const n = matchedArgCommand.commandNames[0]
        const u = `${this.prefix}${n} \`${await lang.translate(matchedArgCommand.usage)}\``
        const e = new MessageEmbed().addFields([{name: await lang.translate('info.help.about.usage'), value: u}])
        e.addFields({name: await lang.translate('info.help.about.examples'), value:  matchedArgCommand.examples.map(e=>`${this.prefix}${n} ${e}`).join('\n')})
        message.reply({content: t,embeds: [e]})
        return
      }
      await matchedArgCommand.checkPermissions(message,lang, this.prefix).then(b=>{
       if(b) matchedArgCommand.run(message,lang,commandParser.args, this.prefix).catch(error => {
         message.react('❌').catch()
         lang.reply('errors.unknown' + `\nError: ${error.message || null}`)
         console.error(`"${this.echoMessage(message)}" falló por "${error.stack}"`)
      })});
    }else return
    console.log(`Comando '${this.echoMessage(message)}' ejecutado por ${message.author.tag}`);
  }

  async handleInteraction(interaction: Interaction): Promise<void>{
    let lang: InteractionLang
    if (interaction.guild === null) lang = new InteractionLang(interaction)
    else{
      lang = new InteractionLang(interaction)
      const g = interaction.guild
      const [rows] = await Connections.db.execute<RowDataPacket[]>('SELECT prefix FROM guilds WHERE id=?', [g.id])
      if(rows[0].prefix) this.prefix = rows[0].prefix
      else Connections.db.query('INSERT INTO guilds VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE id=id;', [g.id, g.name, '!!', 'es']).then(()=>console.log('Servidor registrado: ' + g.id)).catch(e=>console.error(e));
    }
    if(interaction.isButton()){
        if(interaction.customId.startsWith('help')){
            const h = <HelpCommand>CommandHandler.argCommands.find(c=>c.commandNames[0] == 'help')
            h.change_page(interaction, lang, this.prefix)
        }
        if(interaction.customId.endsWith('def')){
          const d = <DefineCommand>CommandHandler.argCommands.find(c=>c.commandNames[0] == 'define')
          d.change_page(interaction)
        }
    }
    if (!interaction.isCommand()) return;
    const command = CommandHandler.slashes.find(c => c.commandNames[0] == interaction.commandName)
    if (!command) return
    try {
      const v = await command.verify(interaction, lang)
      if(v) command.interact(interaction, lang, this.prefix)
    } catch (error) {
      console.error(error);
      const err_reply = await lang.translate('errors.unknown')
      await interaction.reply({ content: err_reply, ephemeral: true });
    }
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
