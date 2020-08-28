import { Client,Message, User} from "discord.js";
export class UserFinder {
   /**
     * 
     * @param {Message} message 
     * @param {String} mention 
     */
    static getUser(message: Message, mention:string):User | undefined {
        const c:Client = message.client
        
        // Verifica que la variable sea una mención
        let matches = mention.match(/<@(\d{17,19})>/);
        // Si no hay coincidencia en el formato, 'matches' será nulo
        if (!matches){
            matches = mention.match(/\d{17,19}/)
            if (!matches) {
                if (mention.startsWith('@')) {
                    mention = mention.slice(1)
                }
                const split = mention.split('#',2)
                if (split.length == 1) {
                    for (const user of c.users.cache.values()) {
                        if (mention.toLowerCase() == user.username) {
                            return user;
                        }
                    }
                }else if(split.length == 2){
                    for (const user of c.users.cache.values()) {
                        if (split[0] == user.username && split[1] == user.discriminator) {
                            return user
                        }
                    }
                }

            
            }
            const id:string = matches![0]
            return c.users.cache.get(id) || undefined
        }
        // La ID corresponde al segundo elemento del array devuelto
        const id: string = matches[1]
        return c.users.cache.get(id);
    }
  }