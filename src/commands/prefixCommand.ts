import { Message } from "discord.js";
import { RowDataPacket } from "mysql2";
import { Connections } from "../config/connections";
import Command from "./commandInterface";
import { Lang } from "./lang/Lang";

export class PrefixComand implements Command {
    commandNames: string[] = ['prefix'];
    guildExclusive = true;
    shortdescription = 'info.prefix.description';
    fulldescription = this.shortdescription
    type: string | undefined;
    async run(msg: Message, l: Lang): Promise<void> {
        const g = msg.guild
        if(!g) return
        const [rows] = await Connections.db.execute<RowDataPacket[]>('SELECT prefix FROM guilds WHERE id=?', [g.id])
        const row = rows[0]
        l.send('info.prefix.success', row.prefix)
    }
}