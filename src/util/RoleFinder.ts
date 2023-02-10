import { Guild, Role } from "discord.js";

export class RoleFinder {
	static getRole(guild: Guild, mention:string):Role | undefined {
		// Verifica que la variable sea una mención
		let matches = mention.match(/<&?(\d{17,19})>/);
		// Si no hay coincidencia en el formato, 'matches' será nulo
		if (!matches){
			matches = mention.match(/\d{17,19}/)
			if (!matches) {
				if(mention === 'everyone') return guild.roles.everyone
				for (const role of guild.roles.cache.values()) {
					if (mention.toLowerCase() == role.name.toLowerCase()) return role
				}
				return undefined
			}
			const id:string = matches[0]
			return guild.roles.cache.get(id)
		}
		// La ID corresponde al segundo elemento del array devuelto
		const id: string = matches[1]
		return guild.roles.cache.get(id);
	}
}