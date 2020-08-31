import Command from "./commandInterface"
import { Message } from "discord.js"
export class UnbanEveryoneCommand implements Command {
  shortdescription: string = 'Desbanea a todos'
  fulldescription: string = this.shortdescription
  guildExclusive: boolean = true
  commandNames = ["unbaneveryone"]
  async run(message: Message): Promise < void > {
    const g = message.guild!
    g.fetchBans().then(banCollection=>{
      banCollection.each(banInfo=>{
       const user = banInfo.user
       g.members.unban(user,'comando activado');
      });
    });
  }
}