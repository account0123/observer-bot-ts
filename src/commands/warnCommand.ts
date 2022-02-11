import { Message } from "discord.js";
import { RowDataPacket } from "mysql2";
import { Connections } from "../config/connections";
import { MemberFinder } from "../util/MemberFinder";
import ArgCommand from "./commandArgInterface";
import { Lang } from "./lang/Lang";

export class WarnCommand implements ArgCommand {
    requiredArgs = 2;
    commandNames: string[] = ['warn'];
    guildExclusive = true
    shortdescription = 'info.warn.description';
    fulldescription = this.shortdescription
    usage = 'info.warn.usage';
    examples: string[] = ['@user spam', '123456789987654321 no memes in general'];
    permission = ''
    type = 'mod'
    async run(msg: Message, l: Lang, args: string[]): Promise<void> {
        const g = msg.guild
        const mention = args.shift() || ''
        const m = MemberFinder.getMember(msg, mention)
        
        if(!g) return
        if(!m){
            l.reply('errors.invalid_member', mention)
            return
        }

        const mod = g.members.resolve(msg.author)
        if(!mod) return
        const [r1] = await Connections.db.query<RowDataPacket[]>('SELECT warnings, kicks, bans FROM users WHERE id=?', [m.id])
        const w: number[] = r1.map((r)=>r.warnings)
        const k: number[] = r1.map((r)=>r.kicks)
        const b: number[] = r1.map((r)=>r.bans)
        let warnings = 0, kicks = 0, bans = 0
        if(w.length > 0){
            warnings = w.sort((a,b)=>a - b)[0]
            kicks = k.sort((a,b)=>a - b)[0]
            bans = b.sort((a,b)=>a - b)[0]
        }
        
        const reason = args.join(' ')
        if(reason.length > 255){
            l.send('info.warn.long_reason')
            return
        }
        Connections.db.execute('INSERT INTO users values(?, ?, ?, ?, ?, ?)', [m.id, g.id, warnings + 1, kicks, bans, reason])
        // Respuesta
        l.send('info.warn.success', m.user.tag, mod.user.username, reason, `${warnings + 1}`)
    }
    async checkPermissions(msg: Message, l: Lang): Promise<boolean> {
        if(!msg.guild) return false
        const [rows] = await Connections.db.execute<RowDataPacket[]>('SELECT id, commands FROM roles WHERE guild=?', [msg.guild.id])
        const mod = msg.guild.members.resolve(msg.author)
        if(!mod) return false
        for (const r of mod.roles.cache.keys()){
            for (const row of rows) {
                if(row.id == r){
                    if(row.commands.includes('warn')) return true
                }
            }
        }
        l.reply('errors.forbidden')
        return false
    }
    
}