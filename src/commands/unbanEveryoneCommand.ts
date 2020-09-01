import Command from "./commandInterface"
import { Message } from "discord.js"
export class UnbanEveryoneCommand implements Command {
  shortdescription: string = 'Desbanea a todos'
  fulldescription: string = this.shortdescription
  guildExclusive: boolean = true
  commandNames = ["unbaneveryone"]
  async run(msg: Message): Promise < void > {
    const g = msg.guild!
    g.fetchBans().then(banCollection=>{
      banCollection.each(banInfo=>{
       const user = banInfo.user
       g.members.unban(user,'comando activado').catch(e=>{
         msg.channel.send(`Error al desbanear a ${user.tag}`)
         console.error(`Se intentó desbanear a ${user.tag} pero ocurrió el siguiente error.`)
         console.error(e.stack)
       });
      });
    });
  }
}