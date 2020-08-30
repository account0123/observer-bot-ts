import { Message } from "discord.js";

export default interface Command {
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
   * Si no hay una, se debe utilizar `this.shortdescription` como valor 
   */
  readonly fulldescription: string

  /** Ejecución del comando. La función debe ser asincrónica. */
  run(parsedUserCommand: Message): Promise<void>
}
