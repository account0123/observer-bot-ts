import { Message, MessageEmbed, PartialMessage, TextChannel} from "discord.js";
import { RowDataPacket } from "mysql2";
import { Lang } from "../commands/lang/Lang";
import { Connections } from "../config/connections";

export class Logger {

    static async logDeleted(msg: Message | PartialMessage, guild_id: string, l: Lang): Promise<void>{
        const [rows] = await Connections.db.execute<RowDataPacket[]>('SELECT log FROM guilds WHERE id=?', [guild_id])
        if(rows.length == 0) return
        const row = rows[0]
        const channel_id = row.log
        if(!channel_id) return
        if(!msg.guild || !msg.client.user) return
		const bot = msg.guild.members.resolve(msg.client.user)
        let color = 0
		if(bot) color = bot.displayColor

        const a = msg.author
        if(!a) return
        if(msg.channel.type == "DM") return
        const d = `**Enviado en [#${msg.channel.name}](https://discord.com/channels/${msg.guild.id}/${msg.channel.id}):**\n${msg.content}`
        const footer = await l.translate('info.snipe.success')
        const e = new MessageEmbed().setAuthor({name: String(a.username), iconURL: a.avatarURL() || undefined}).setColor(color).setDescription(d).setFooter({text: footer}).setTimestamp(msg.createdTimestamp)
        const channel = msg.guild.channels.resolve(channel_id)
        if(!channel || !(channel instanceof TextChannel)) return
        channel.send({embeds: [e]})
    }

    static async logEdited(msg: Message | PartialMessage, u: Message | PartialMessage, guild_id: string, l: Lang): Promise<void>{
        const [rows] = await Connections.db.execute<RowDataPacket[]>('SELECT log FROM guilds WHERE id=?', [guild_id])
        if(rows.length == 0) return
        const row = rows[0]
        const channel_id = row.log
        if(!channel_id) return
        if(!msg.guild || !msg.client.user) return
		const bot = msg.guild.members.resolve(msg.client.user)
        let color = 0
		if(bot) color = bot.displayColor
        const a = msg.author
        if(!a) return
        const d = await l.translate('info.editsnipe.body', msg.content || '', u.content || '')
        const footer = await l.translate('info.editsnipe.success')
        const e = new MessageEmbed().setAuthor({name: String(a.username), iconURL: a.avatarURL() || undefined}).setColor(color).setDescription(d).setFooter({text: footer}).setTimestamp(msg.createdTimestamp)
        const channel = msg.guild.channels.resolve(channel_id)
        if(!channel || !(channel instanceof TextChannel)) return
        channel.send({embeds: [e]})
    }
}