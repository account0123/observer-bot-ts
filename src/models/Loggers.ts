import { Message, MessageEmbed, PartialMessage, TextChannel, User, UserFlags } from "discord.js";
import { RowDataPacket } from "mysql2";
import { Lang } from "../commands/lang/Lang";
import { Connections } from "../config/connections";

export class Logger {

    static async logDeleted(msg: Message | PartialMessage, guild_id: string, l: Lang): Promise<void>{
        const [rows] = await Connections.db.execute<RowDataPacket[]>('SELECT log FROM guilds WHERE id=?', [guild_id])
        const row = rows[0]
        const channel_id = row.log
        if(!channel_id) return
        if(!msg.guild || !msg.client.user) return
		const bot = msg.guild.member(msg.client.user)
        let color = 0
		if(bot) color = bot.displayColor
        const a = msg.author || new User(msg.client,{username: 'Unknown',discriminator:'0000',id:'123456789987654321',locale:'es',bot:false,avatar:'https://cdn.discordapp.com/attachments/697873617945493565/748390370496479352/black.png',flags: new UserFlags(0),system:false});
        if(msg.channel.type == "dm") return
        const d = `**Enviado en [#${msg.channel.name}](https://discord.com/channels/${msg.guild.id}/${msg.channel.id}):**\n${msg.content}`
        const footer = await l.translate('info.snipe.success')
        const e = new MessageEmbed().setAuthor(a.username, a.avatarURL() || undefined).setColor(color).setDescription(d).setFooter(footer).setTimestamp(msg.createdTimestamp)
        
        const channel = msg.guild.channels.resolve(channel_id)
        if(!channel || !(channel instanceof TextChannel)) return
        channel.send(e)
    }

    static async logEdited(msg: Message | PartialMessage, u: Message | PartialMessage, guild_id: string, l: Lang): Promise<void>{
        const [rows] = await Connections.db.execute<RowDataPacket[]>('SELECT log FROM guilds WHERE id=?', [guild_id])
        const row = rows[0]
        const channel_id = row.log
        if(!channel_id) return
        if(!msg.guild || !msg.client.user) return
		const bot = msg.guild.member(msg.client.user)
        let color = 0
		if(bot) color = bot.displayColor
        const a = msg.author || new User(msg.client,{username: 'Unknown',discriminator:'0000',id:'123456789987654321',locale:'es',bot:false,avatar:'https://cdn.discordapp.com/attachments/697873617945493565/748390370496479352/black.png',flags: new UserFlags(0),system:false});
        const d = await l.translate('info.editsnipe.body', msg.content || '', u.content || '')
        const footer = await l.translate('info.editsnipe.success')
        const e = new MessageEmbed().setAuthor(a.username, a.avatarURL() || undefined).setColor(color).setDescription(d).setFooter(footer).setTimestamp(msg.createdTimestamp)
        const channel = msg.guild.channels.resolve(channel_id)
        if(!channel || !(channel instanceof TextChannel)) return
        channel.send(e)
    }
}