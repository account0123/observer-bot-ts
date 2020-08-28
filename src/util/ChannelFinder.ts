import { Message, Guild, GuildChannel } from "discord.js";
export class ChannelFinder {
  /**
   * 
   * @param {Message} message 
   * @param {String} mention 
   */
  static getMember(message: Message, mention: string): GuildChannel | undefined {
    const g: Guild = message.guild!

      // Verifica que la variable sea una mención
      let matches = mention.match(/<#(\d{17,19})>/);
    // Si no hay coincidencia en el formato, 'matches' será nulo
    if (!matches) {
      matches = mention.match(/\d{17,19}/)
      if (!matches) {
      for (const channel of g.channels.cache.values()) {
            if (mention.toLowerCase() == channel.name) {
              return channel
            }
          }
        }
      const id: string = matches![0]
      return g.channels.cache.get(id)
    }
    // La ID corresponde al segundo elemento del array devuelto
    const id: string = matches[1]
    return g.channels.cache.get(id);
  }
}