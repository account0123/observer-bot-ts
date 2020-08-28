import { Message, Role, Guild } from "discord.js";

export class RoleFinder {
	/**
	  * 
	  * @param {Message} message 
	  * @param {String} mention 
	  */
	 static getRole(message: Message, mention:string):Role | undefined {
		 const g:Guild = message.guild!
		 
		 // Verifica que la variable sea una mención
		 let matches = mention.match(/<@!?(\d{17,19})>/);
		 // Si no hay coincidencia en el formato, 'matches' será nulo
		 if (!matches){
			 matches = mention.match(/\d{17,19}/)
			 if (!matches) {
				 for (const role of g.roles.cache.values()) {
					if (mention.toLowerCase() == role.name) return role
					}
			 }
			 const id:string = matches![0]
			 return g.roles.cache.get(id)
		}
		 // La ID corresponde al segundo elemento del array devuelto
		 const id: string = matches[1]
		 return g.roles.cache.get(id);
	 }
   }