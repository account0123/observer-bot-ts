import { Message, MessageEmbed } from "discord.js";
import Command from "./commandInterface";
import { Lang } from "./lang/Lang";

const link = 'https://discord.com/api/oauth2/authorize?client_id=685645806069612621&permissions=275884862550&scope=bot'

export class InviteCommand implements Command {
    type = undefined;
    commandNames = ['invite']
    guildExclusive = false
    shortdescription = 'info.invite.description'
    fulldescription = this.shortdescription
    
    async run(msg: Message, l: Lang): Promise<void> {
        const t = await l.translate('info.invite.text')
        const u = msg.client.user
        if(!u) return Promise.reject('client has not user')
        const e = new MessageEmbed().setDescription(`[${t}](${link})`).setAuthor(u.tag, u.avatarURL() || undefined)
        msg.channel.send(e)
    }
    
}