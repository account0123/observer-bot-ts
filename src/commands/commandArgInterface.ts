import { Message, MessageEmbed } from "discord.js";

export default interface ArgCommand {
  /**
   * List of aliases for the command.
   * The first name in the list is the primary command name.
   */
  readonly commandNames: string[]

  /** Argumentos mínimos */
  readonly requiredArgs: number

  /** Ejemplos */
  readonly examples: string[]

  /** Usage documentation. */
  readonly usage: string
  /** Determina si el comando no puede usarse en mensajes privados */
  readonly guildExclusive: boolean

  /** Execute the command. */
 run(msg: Message, args: string[]): Promise<void>

 /** Verifica que el permiso se pueda ejecutar */
 checkPermissions(msg: Message): Promise<boolean>
}