import fs from 'fs'
import { Connections } from "../../config/connections";
import { Message } from "discord.js";
import { RowDataPacket } from 'mysql2';
export class Lang {
	language:string | undefined
	private msg:Message
	constructor(msg: Message,locale?:string){
		this.msg = msg
		if(!msg.guild) {
			switch(locale){
				case '': case 'es':
					this.language = 'es'
					break
				case 'en': default:
					this.language = 'en'
					break
			}
		}
	}
	async request(guild_id: string):Promise<string> {
		try {
			const [rows, fields] = await Connections.db.execute<RowDataPacket[]>('SELECT language FROM guilds WHERE id=?', [guild_id])
			const row = rows[0]
			return row.language
		} catch (error) {
			console.error('COULDN\'T FIND GUILD ' + guild_id + ' PLEASE UPDATE')
			console.error('Continuando con idioma inglés')
			return 'en'
		}
	}
	async send(code:string,...values:string[]):Promise<Message>{
		if (!this.language) {
			this.language = await this.request(this.msg.guild!.id)
		}
		const content = fs.readFileSync(`./build/commands/lang/${this.language}.json`,{encoding: 'utf-8'})
		var obj = JSON.parse(content)
		const arr = code.split(".");
        while(arr.length > 0) {
            let arg:string = arr.shift()!
			obj = obj[arg];
			if(!obj){
				const e = new Error(`No se ha encontrado ${code} en el json`);
				e.name = 'Busqueda fallida';
				throw e;
			}
        }
		var script:string = obj
		const data = script.match(/\{[\w.]+\}/gm)
		if(!data){
			return this.msg.channel.send(script)
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
		return this.msg.channel.send(script, {disableMentions: 'everyone'})
	}
	async reply(code:string,...values:string[]):Promise<Message>{
		if (!this.language) {
			this.language = await this.request(this.msg.guild!.id)
		}
		const content = fs.readFileSync(`./build/commands/lang/${this.language}.json`,{encoding: 'utf-8'})
		var obj = JSON.parse(content)
		const arr = code.split(".");
        while(arr.length > 0) {
            let arg:string = arr.shift()!
			obj = obj[arg];
			if(!obj){
				const e = new Error(`No se ha encontrado ${code} en el json`);
				e.name = 'Busqueda fallida';
				throw e;
			}
        }
		var script:string = obj
		const data = script.match(/\{[\w.]+\}/gm)
		if(!data){
			return this.msg.reply(script)
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
		return this.msg.reply(script, {disableMentions: 'everyone'})
	}
	async translate(code:string,...values:string[]):Promise<string>{
		if (!this.language) {
			this.language = await this.request(this.msg.guild!.id)
		}
		const content = fs.readFileSync(`./build/commands/lang/${this.language}.json`,{encoding: 'utf-8'})
		var obj = JSON.parse(content)
		const arr = code.split(".");
        while(arr.length > 0) {
            let arg:string = arr.shift()!
			obj = obj[arg];
			if(!obj){
				const e = new Error(`No se ha encontrado ${code} en el json`);
				e.name = 'Busqueda fallida';
				throw e;
			}
        }
		var script:string = obj
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