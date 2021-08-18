import { Message, Guild, GuildChannel, CategoryChannel, Snowflake, TextChannel } from "discord.js";
export class ChannelFinder {
  /**
   * 
   * @param {Message} message 
   * @param {String} mention 
   */
  static getChannel(message: Message, mention: string): GuildChannel | undefined {
    const g = message.guild
    if(!g) return undefined
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
          return undefined
        }
      const id: string = matches[0]
      return g.channels.cache.get(id)
    }
    // La ID corresponde al segundo elemento del array devuelto
    const id: string = matches[1]
    return g.channels.cache.get(id);
  }

  static getTextChannel(message: Message, mention: string): TextChannel | undefined {
    const g: Guild = message.guild!

      // Verifica que la variable sea una mención
      let matches = mention.match(/<#(\d{17,19})>/);
    // Si no hay coincidencia en el formato, 'matches' será nulo
    if (!matches) {
      matches = mention.match(/\d{17,19}/)
      if (!matches) {
      for (const channel of g.channels.cache.values()) {
            if (mention.toLowerCase() == channel.name && channel instanceof TextChannel) {
              return channel
            }
          }
        }
      const id: string = matches![0]
      const channel = g.channels.cache.get(id)
      return channel instanceof TextChannel ? channel : undefined
    }
    // La ID corresponde al segundo elemento del array devuelto
    const id: string = matches[1]
    const channel = g.channels.cache.get(id)
    return channel instanceof TextChannel ? channel : undefined
  }
  
  static getCategoryId(message: Message, mention:string): Snowflake | undefined{
    if(!message.guild) return undefined
    for (const channel of message.guild.channels.cache.values()) {
      if(channel instanceof CategoryChannel){
        if(mention.toLowerCase().trim() === channel.name.toLowerCase()) return channel.id
      }
    }
  }
}