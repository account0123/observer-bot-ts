import { GuildMember, Guild} from "discord.js";

export class MemberFinder {
    static getMember(guild: Guild, mention:string):GuildMember | undefined {
        // Verifica que la variable sea una mención
        let matches = mention.match(/<@!?(\d{17,19})>/);
        // Si no hay coincidencia en el formato, 'matches' será nulo
        if (!matches){
            matches = mention.match(/\d{17,19}/)
            if (!matches) {
                if (mention.startsWith('@')) {
                    mention = mention.slice(1).toLowerCase()
                }
                const split = mention.split('#',2)
                if (split.length == 1) {
                    for (const member of guild.members.cache.values()) {
                        const nick = member.nickname || member.displayName
                        if (mention == member.user.username.toLowerCase() || mention == nick.toLocaleLowerCase()) {
                            return member
                        }
                    }
                }else if(split.length == 2){
                    for (const member of guild.members.cache.values()) {
                        const nick = member.nickname || member.displayName
                        if ((split[0] == member.user.username.toLowerCase() || split[0] == nick.toLowerCase()) && split[1] == member.user.discriminator) {
                            return member
                        }
                    }
                }
                return undefined
            }
            const id:string = matches[0]
            return guild.members.cache.get(id)
        }
        // La ID corresponde al segundo elemento del array devuelto
        const id: string = matches[1]
        return guild.members.cache.get(id);
    }
}