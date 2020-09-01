import { Message } from "discord.js";

/** A user-given command extracted from a message. */
export class CommandParser {

  readonly parsedCommandName: string;  /** Command name in all lowercase. */
  readonly args: string[];             /** Arguments (split by space). */
  readonly originalMessage: Message;   /** Original Message the command was extracted from. */
  readonly commandPrefix: string;

  constructor(message: Message, prefix: string) {
    var text = ''
    const content = message.content
    if (content.startsWith(prefix)) text = message.content.slice(prefix.length)
    if (content.startsWith('<@685645806069612621> ')) text = message.content.slice(22)
    if (content.startsWith('<@!685645806069612621> ')) text = message.content.slice(23)
    this.commandPrefix = prefix;
    const splitMessage = text.trim().split(/ +/g);
    const commandName = splitMessage.shift() || "";
    this.parsedCommandName = commandName.toLowerCase();
    this.args = splitMessage;
    this.originalMessage = message;
  }
}