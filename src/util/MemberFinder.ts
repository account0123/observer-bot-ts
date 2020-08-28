import { Message, Guild, GuildMember} from "discord.js";
export class MemberFinder {
   /**
     * 
     * @param {Message} message 
     * @param {String} mention 
     */
    static getMember(message: Message, mention:string):GuildMember | undefined {
        const g:Guild = message.guild!
        
        // Verifica que la variable sea una mención
        let matches = mention.match(/<@!?(\d{17,19})>/);
        // Si no hay coincidencia en el formato, 'matches' será nulo
        if (!matches){
            matches = mention.match(/\d{17,19}/)
            if (!matches) {
                if (mention.startsWith('@')) {
                    mention = mention.slice(1)
                }
                const split = mention.split('#',2)
                if (split.length == 1) {
                    for (const member of g.members.cache.values()) {
                        if (mention.toLowerCase() == member.user.username || mention.toLowerCase() == member.nickname) {
                            return member
                        }
                    }
                }else if(split.length == 2){
                    for (const member of g.members.cache.values()) {
                        if ((split[0] == member.user.username || split[0] == member.nickname) && split[1] == member.user.discriminator) {
                            return member
                        }
                    }
                }

            
            }
            const id:string = matches![0]
            return g.members.cache.get(id)
        }
        // La ID corresponde al segundo elemento del array devuelto
        const id: string = matches[1]
        return g.members.cache.get(id);
    }
  }