import express, { Request, Response } from 'express';
import Discord, { Message, PartialMessage } from "discord.js";
import { DISCORD_TOKEN } from './config/secrets';
import CommandHandler from './commandHandler';
import SnipeHandler from './snipeHandler';
import { Connections } from './config/connections';

const PORT = parseInt(process.argv[2]) || 5000;

const app = express();
const client = new Discord.Client({ws:{intents: ['DIRECT_MESSAGES', 'GUILDS', 'GUILD_BANS', 'GUILD_INTEGRATIONS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS', 'GUILD_WEBHOOKS']}});


//////////////////////////////////////////////////////////////////
//             EXPRESS SERVER SETUP FOR UPTIME ROBOT            //
//////////////////////////////////////////////////////////////////
app.use(express.urlencoded({ extended: true }));

app.use('/', (request: Request, response: Response) => {
  response.sendStatus(200);
});

const sniper = new SnipeHandler();
const handler = new CommandHandler();

//////////////////////////////////////////////////////////////////
//                    DISCORD CLIENT LISTENERS                  //
//////////////////////////////////////////////////////////////////
// Discord Events: https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-channelCreate

client.on("ready", async () => {
  console.log("Observer has started")
  new Connections(client)
  await new Promise(resolve => setTimeout(resolve, 10000));
  for (const g of client.guilds.cache.values()) {
    const q = Connections.db.query('INSERT INTO guilds VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE id=id;', [g.id, g.name, '!!', 'es', null]);
    q.then(()=>console.log('Servidor cargado: ' + g.id));
    q.catch(e=>console.error(e));
  }
});
client.on("message", (message: Message)=>handler.handleMessage(message));
client.on('messageDelete',(deleted: Message| PartialMessage)=>sniper.saveDeletedMessage(deleted))
client.on('messageUpdate',(old: Message | PartialMessage, updated: Message | PartialMessage)=>sniper.saveEditedMessage(old, updated))
client.on('guildCreate', guild => {
  const q = Connections.db.query('INSERT INTO guilds VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE id=id;', [guild.id, guild.name, '!!', 'es', null]);
  q.then(()=>console.log('Servidor nuevo registrado: ' + guild.name));
  q.catch(e=>console.error(e));
});

client.on("error", e =>{
  console.error("Discord client error!", e)
  process.exit(1)
})

// Beta NzA4ODg0MjYwNjY0MjQ2MzI0.Xrd16g.3CkRz6-jepJ5P8d3qcSnjMKu1lo
if(process.argv[2] == '--beta') client.login('NzA4ODg0MjYwNjY0MjQ2MzI0.Xrd16g.3CkRz6-jepJ5P8d3qcSnjMKu1lo').catch(e=>console.error(e));
else client.login(DISCORD_TOKEN).catch(e=>console.error(e));

app.listen(PORT, () => console.log(`Server started on port ${PORT}!`))