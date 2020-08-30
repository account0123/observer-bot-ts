import Command from "./commandInterface"
import { Message } from "discord.js"

export class ActivitycheckCommand implements Command {
  shortdescription: string = 'Muestra los estados de actividad.'
  fulldescription: string = 'Muestra los estados de actividad de los miembros del servidor en general.'
  guildExclusive: boolean = true
  commandNames = ['activitycheck','statuscheck']
  async run(message: Message): Promise<void> {
        let connected:number = 0
        let idle :number = 0
        let dnd:number = 0 
        let offline:number = 0
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
        
       await message.channel.send(`Conectados: ${connected}/${total}\nAusentes: ${idle}/${total}\nOcupados: ${dnd}/${total}\nDesconectados: ${offline}/${total}\nEste servidor está ${this.isActive(offline,total)}.`);
  }
  isActive(o:number,t:number): string{
    return o > (t /4) ? 'muerto' : 'activo!!! Parece una fiesta!!!!'
  }
}
