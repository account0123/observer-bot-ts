import { Message, MessageEmbed } from "discord.js";

export default interface ArgCommand {
  requiredArgs: number;
   /**
   * Lista de alias. El nombre principal debe ir primero
   */
  readonly commandNames: string[]

  /**
   * Determina si el comando solo es utilizable en servidores y no en mensajes privados.
   */
  readonly guildExclusive: boolean
  
  /** Descripción corta */
  readonly shortdescription: string
  
  /** Descripción detallada del comando. 
   * Si no hay una, se usa `this.shortdescription` como valor 
   */
  readonly fulldescription: string

  /** Formato de los argumentos del comando */
  readonly usage: string

  /** Ejemplos de los argumentos comando */
  readonly examples: string[]

  /** Ejecución del comando. La función debe ser asincrónica. */
 run(msg: Message, args: string[]): Promise<void>

 /** Verifica que el permiso se pueda ejecutar */
 checkPermissions(msg: Message): Promise<boolean>
}