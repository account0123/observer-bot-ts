import Command from "./commandInterface"
import { Message } from "discord.js"
import { Lang } from "./lang/Lang"

export class ActivitycheckCommand implements Command {
  shortdescription: string= 'info.activity.description'
  fulldescription: string = 'info.activity.fulldescription'
  guildExclusive: boolean = true
  commandNames = ['activitycheck','statuscheck']
  async run(message: Message,l: Lang): Promise<void> {
        var connected:number = 0
        var idle :number = 0
        var dnd:number = 0 
        var offline:number = 0
        if (!message.guild) return
        for (const member of message.guild.members.cache.values()) { 
            if(member.user.bot) continue;  
            switch (member.presence.status) {
                case 'online':
                    connected++;
                    break;
                case 'idle':
                    idle++;
                    break;
                case 'dnd':
                    dnd++;
                    break;
                case 'offline':
                    offline++;
            }
        }
        const total:number = connected + idle + dnd + offline;
        l.send('info.activity.success','' + connected,'' + total,'' + idle,'' + total,'' + dnd,'' + total,'' + offline,'' + total,await this.isActive(offline, total, l))
  }
  async isActive(o:number,t:number, l: Lang): Promise<string>{
    return o > (t /4) ? await l.translate('info.activity.dead') : await l.translate('info.activity.alive')
  }
}
