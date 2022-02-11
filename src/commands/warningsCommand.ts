import { Message, MessageEmbed } from "discord.js";
import { RowDataPacket } from "mysql2";
import { Connections } from "../config/connections";
import { MemberFinder } from "../util/MemberFinder";
import ArgCommand from "./commandArgInterface";
import { Lang } from "./lang/Lang";

export class WarningsCommand implements ArgCommand {
    requiredArgs = 1
    commandNames: string[] = ['warnings', 'warnlist']
    guildExclusive = true
    shortdescription = 'info.warnings.shortdescription'
    fulldescription: string = this.shortdescription
    usage = 'info.warnings.usage'
    examples: string[] = ['123456789987654321', '@user#1234']
    permission = ''
    type: string | undefined = 'mod'
    async run(msg: Message, l: Lang, args: string[]): Promise<void> {
        if(!msg.guild) return
        const user = args[0]
        const m = MemberFinder.getMember(msg, user)
        if(!m){
            l.send('errors.invalid_member', user)
            return
        }

        const [rows] = await Connections.db.query<RowDataPacket[]>('SELECT warnings, kicks, bans, reason FROM users WHERE id=?', [m.id])
        const embed = new MessageEmbed().setAuthor(await l.translate('info.warnings.title', m.user.username))
        let w = 0, k = 0, b = 0, action = '', desc = ''
        if(rows.length == 0){
            embed.setDescription(await l.translate('info.warnings.empty'))
            embed.setFooter({text: await l.translate('info.warnings.footer', msg.author.tag)})
            msg.channel.send({embeds: [embed]})
            return
        }
        const loading = await msg.channel.send(`\`Cargando advertencias de ${m.user.username}...\``)
        for (const row of rows) {
            console.log(typeof row.warnings + '\n' + typeof row.kicks + '\n' + typeof row.bans)
            if(row.warnings > w){
                w = row.warnings
                action = w + 'º advertencia'
            }
            if(row.kicks > k){
                k = row.kicks
                action = k + 'º expulsión'
            }
            if(row.bans > b){
                b = row.bans
                action = b + 'º baneo'
            }
            desc += `\n\n**${action}**\n\`\`\`${row.reason}\`\`\``
        }
        embed.setDescription(desc)
        loading.edit({content: '', embeds: [embed]})
    }
    async checkPermissions(): Promise<boolean> {
        return true
    }
    
}