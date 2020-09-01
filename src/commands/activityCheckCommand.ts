import Command from "./commandInterface"
import { Message } from "discord.js"
import { Lang } from "./lang/Lang"

export class ActivitycheckCommand implements Command {
  shortdescription: string
  fulldescription: string
  guildExclusive: boolean = true
  commandNames = ['activitycheck','statuscheck']
  lang:Lang
  constructor(guild_id: string){
    const lang = new Lang(guild_id)
    this.lang = lang
    this.shortdescription = lang.translate('info.activity.description')
    this.fulldescription = lang.translate('info.activity.fulldescription')
  }
  async run(message: Message): Promise<void> {
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
        this.lang.send('info.activity.success',message,'' + connected,'' + total,'' + idle,'' + total,'' + dnd,'' + total,'' + offline,'' + total,this.isActive(offline,total))
  }
  isActive(o:number,t:number): string{
    return o > (t /4) ? this.lang.translate('info.activity.dead') : this.lang.translate('info.activity.alive')
  }
}
