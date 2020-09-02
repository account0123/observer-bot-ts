import fs from 'fs'
import { Connections } from "../../config/connections";
import { Message } from "discord.js";
export class Lang {
	private lang:string
	constructor(guild_id: string){
		switch(guild_id){
			case '': case 'es':
				this.lang = 'es'
				return
			case 'en':
				this.lang = 'en'
				return
		}
		Connections.db.query('SELECT language FROM guilds WHERE id=?',[guild_id],(err,rows,fields) =>{
			if(err) throw err
			if(rows.length === 0) {
				console.error('COULDN\'T FIND GUILD ' + guild_id + ' PLEASE UPADTE')
				this.lang = 'es'
				return
			}
			const row = rows[0]
			switch (row.lang) {
				case 'es':
					this.lang = 'es'
					return
				case 'en':
					this.lang = 'en'
					return
			}
		});
		this.lang = 'es'
	}
	send(code:string,msg:Message,...values:string[]){
		const content = fs.readFileSync(`./${this.lang}.json`,{encoding: 'utf-8'})
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
		const data = script.match(/\{.+\}/gm)
		if(!data){
			msg.channel.send(script)
			return
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
		msg.channel.send(script)
	}
	reply(code:string,msg:Message,...values:string[]){
		const content = fs.readFileSync(`./${this.lang}.json`,{encoding: 'utf-8'})
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
		const data = script.match(/\{.+\}/gm)
		if(!data){
			msg.reply(script)
			return
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
		msg.reply(script)
	}
	translate(code:string,...values:string[]):string{
		const content = fs.readFileSync(`./${this.lang}.json`,{encoding: 'utf-8'})
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
		const data = script.match(/\{.+\}/gm)
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