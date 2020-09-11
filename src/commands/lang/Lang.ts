import fs from 'fs'
import { Connections } from "../../config/connections";
import { Message } from "discord.js";
export class Lang {
	locale:string
	private msg:Message
	constructor(msg: Message,locale?:string){
		this.msg = msg
		if(locale){
			switch(locale){
				case '': case 'es':
					this.locale = 'es'
					return
				case 'en': default:
					this.locale = 'en'
					return
			}
		}
		const guild_id = msg.guild!.id
		Connections.db.query('SELECT language FROM guilds WHERE id=?',[guild_id],(err,rows,fields) =>{
			if(err) throw err
			if(rows.length === 0) {
				console.error('COULDN\'T FIND GUILD ' + guild_id + ' PLEASE UPADTE')
				this.locale = 'es'
				return
			}
			const row = rows[0]
			switch (row.lang) {
				case 'es':
					this.locale = 'es'
					return
				case 'en':
					this.locale = 'en'
					return
			}
		});
		this.locale = 'es'
	}
	send(code:string,...values:string[]):Promise<Message>{
		const content = fs.readFileSync(`./build/commands/lang/${this.locale}.json`,{encoding: 'utf-8'})
		var obj = JSON.parse(content)
		const arr = code.split(".");
        while(arr.length > 0) {
            let arg:string = arr.shift()!
            obj = obj[arg];
        }
        if(!obj){
            const e = new Error(`No se ha encontrado ${code} en el json`);
            e.name = 'Busqueda fallida';
            throw e;
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
		return this.msg.channel.send(script)
	}
	reply(code:string,...values:string[]):Promise<Message>{
		const content = fs.readFileSync(`./build/commands/lang/${this.locale}.json`,{encoding: 'utf-8'})
		var obj = JSON.parse(content)
		const arr = code.split(".");
        while(arr.length > 0) {
            let arg:string = arr.shift()!
            obj = obj[arg];
        }
        if(!obj){
            const e = new Error(`No se ha encontrado ${code} en el json`);
            e.name = 'Busqueda fallida';
            throw e;
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
		return this.msg.reply(script)
	}
	translate(code:string,...values:string[]):string{
		const content = fs.readFileSync(`./build/commands/lang/${this.locale}.json`,{encoding: 'utf-8'})
		var obj = JSON.parse(content)
		const arr = code.split(".");
        while(arr.length > 0) {
            let arg:string = arr.shift()!
            obj = obj[arg];
        }
        if(!obj){
            const e = new Error(`No se ha encontrado ${code} en el json`);
            e.name = 'Busqueda fallida';
            throw e;
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