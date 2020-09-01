import Command from "./commandInterface";
import { Message, MessageEmbed } from "discord.js";
import { Connections } from "../config/connections";
import { Lang } from "./lang/Lang";

export class EditSnipeCommand implements Command {
	commandNames: string[] = ['editsnipe']
	guildExclusive: boolean = true
	shortdescription: string = 'Muestra el mensaje editado.'
	fulldescription: string = 'Muestra el último mensaje editado de este canal'
	lang:Lang
  constructor(guild_id: string){
    const lang = new Lang(guild_id)
    this.lang = lang
    this.shortdescription = this.fulldescription =  lang.translate('info.avatar.description')
  }
	async run(msg: Message): Promise<void> {
		const bot = msg.guild!.member(msg.client.user!)!
		const color = bot.displayColor
		const connection = Connections.connection
		connection.query('SELECT * FROM edited WHERE channel=? and guild=?',[msg.channel.id, msg.guild!.id],function (err:any, rows) {
			if(err) throw err
			if(rows.length == 0) {
				msg.channel.send('*No hay mensajes que mostrar*')
				return
			}
			const lastrow = rows[rows.length - 1]
			const embed = new MessageEmbed().setAuthor(lastrow.username,lastrow.avatar_url).setColor(color).setDescription(lastrow.content).setFooter('Mensaje editado').setTimestamp(lastrow.time);
			msg.channel.send(embed).catch(e=>{
				msg.reply('Hubo un error al enviar el editsnipe')
				console.error(e.stack)
			});
		})
	}
}