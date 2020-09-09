import { Message } from "discord.js";
import { Lang } from "./lang/Lang";

export default interface Command {
  /**
   * Lista de alias. El nombre principal debe ir primero
   */
  readonly commandNames: string[]

  /**
   * Determina si el comando solo es utilizable en servidores y no en mensajes privados.
   */
  readonly guildExclusive: boolean

  /** Ruta (info.comando.description) a la descripción corta */
  readonly shortdescription: string

  /** Ruta (info.comando.fulldescription) a la descripción detallada del comando. 
   * Si no hay una, se debe utilizar `this.shortdescription` como valor 
   */
  readonly fulldescription: string

  /** Ejecución del comando. La función debe ser asincrónica. */
  run(msg: Message,l: Lang): Promise<void>
}
