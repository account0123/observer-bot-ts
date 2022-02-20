import fs from 'fs'
import { Connections } from "../../config/connections";
import { BaseCommandInteraction, Guild, Interaction, Message} from "discord.js";
import { RowDataPacket } from 'mysql2';
export class Lang {
	language:string | undefined
	private msg:Message
	constructor(msg: Message){
		this.msg = msg
	}
	static async request(guild: Guild | null):Promise<string> {
		try {
			let id = '123456789'
			if(guild) id = guild.id
			const [rows] = await Connections.db.execute<RowDataPacket[]>('SELECT language FROM guilds WHERE id=?', [id])
			const row = rows[0]
			return row.language
		} catch (error) {
			console.error('COULDN\'T FIND GUILD PLEASE UPDATE')
			console.error('Continuando con idioma inglés')
			return 'en'
		}
	}
	async send(code:string,...values:string[]):Promise<Message>{
		const text = await this.translate(code, ...values)
		return this.msg.channel.send(text)
	}
	async reply(code:string,...values:string[]):Promise<Message>{
		const text = await this.translate(code, ...values)
		return this.msg.reply(text)
	}
	async translate(code:string,...values:string[]):Promise<string>{
		if (!this.language)
			this.language = await Lang.request(this.msg.guild)
		const content = fs.readFileSync(`./build/commands/lang/${this.language}.json`,{encoding: 'utf-8'})
		let obj = JSON.parse(content)
		const arr = code.split(".");
        while(arr.length > 0) {
            const arg:string = arr.shift() || ''
			obj = obj[arg];
			if(!obj){
				const e = new Error(`No se ha encontrado ${code} en el json`);
				e.name = 'Busqueda fallida';
				throw e;
			}
        }
		let script:string = obj
		const data = script.match(/\{[\w.]+\}/gm)
		if(!data){
			return script
		}
		if (!values) {
			throw new Error('FALTAN ARGUMENTOS EN EL ENVIO DE DATOS')
		}
		if(data.length > values.length) throw new Error(`FALTAN ${data.length - values.length} ARGUMENTOS EN EL ENVIO DE DATOS`);
		for (let i = 0; i < data.length; i++) {
			const marker = data[i];
			const value = values[i]
			script = script.replace(marker,value)
		}
		return script
	}
}

export class InteractionLang {
	language:string | undefined
	private action: Interaction
	constructor(action: Interaction){
		this.action = action
	}

	async reply(code:string,...values:string[]):Promise<void>{
		const text = await this.translate(code, ...values)
		if(this.action instanceof BaseCommandInteraction)
			return this.action.reply(text)
	}

	async translate(code:string,...values:string[]):Promise<string>{
		if (!this.language)
			this.language = await Lang.request(this.action.guild)
		const content = fs.readFileSync(`./build/commands/lang/${this.language}.json`,{encoding: 'utf-8'})
		let obj = JSON.parse(content)
		const arr = code.split(".");
        while(arr.length > 0) {
            const arg:string = arr.shift() || ''
			obj = obj[arg];
			if(!obj){
				const e = new Error(`No se ha encontrado ${code} en el json`);
				e.name = 'Busqueda fallida';
				throw e;
			}
        }
		let script:string = obj
		const data = script.match(/\{[\w.]+\}/gm)
		if(!data){
			return script
		}
		if (!values) {
			throw new Error('FALTAN ARGUMENTOS EN EL ENVIO DE DATOS')
		}
		if(data.length > values.length) throw new Error(`FALTAN ${data.length - values.length} ARGUMENTOS EN EL ENVIO DE DATOS`);
		for (let i = 0; i < data.length; i++) {
			const marker = data[i];
			const value = values[i]
			script = script.replace(marker,value)
		}
		return script
	}

}