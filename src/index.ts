import express, { Request, Response } from 'express';
import Discord, { Message, PartialMessage, REST, Role, Routes } from "discord.js";
import { DISCORD_TOKEN, BETA_TOKEN } from './config/secrets';
import CommandHandler from './commandHandler';
import SnipeHandler from './snipeHandler';
import { Connections } from './config/connections';
import { RowDataPacket } from 'mysql2';
import { AddRoleCommand, BanCommand, CreateRoleCommand, DefineCommand, HelpCommand, RemoveRoleCommand, SayCommand } from './commands';

const PORT = parseInt(process.argv[2]) || 5000;

const app = express();
// ['DIRECT_MESSAGES', 'GUILDS', 'GUILD_BANS', 'GUILD_INTEGRATIONS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS', 'GUILD_WEBHOOKS']
const client = new Discord.Client({ws:{large_threshold: 1000}, intents: ['DirectMessages', 'Guilds', 'GuildBans', 'GuildIntegrations', 'MessageContent', 'GuildMessageReactions', 'GuildWebhooks']});
const commands = [
  SayCommand.get(),
  AddRoleCommand.get(),
  BanCommand.get(),
  HelpCommand.get(),
  DefineCommand.get(),
  CreateRoleCommand.get(),
  RemoveRoleCommand.get()
]

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
  new Connections()
  await new Promise(resolve => setTimeout(resolve, 10000));
  for (const g of client.guilds.cache.values()) {
    const q = Connections.db.query('INSERT INTO guilds VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE id=id;', [g.id, g.name, '!!', 'es', null]);
    q.then(()=>console.log('Servidor cargado: ' + g.id));
    q.catch((e: string)=>console.error(e));
    const [qr] = await Connections.db.query<RowDataPacket[]>('SELECT id FROM roles WHERE guild=?', [g.id])
    const roles = qr.map((row: RowDataPacket)=>row.id)
    for (const role of g.roles.cache.values()) {
      if(roles.includes(role.id)){
        if(role.managed)
          Connections.db.execute('DELETE FROM roles WHERE id=?', [role.id]).then(()=>console.log('Rol %s eliminado', role.id))
        continue
      }
      if(role.permissions.has('Administrator')) addAdminRole(role)
    }
    console.log("---------Fin configuración de servidor------------")
  }
});

client.on('interactionCreate', async i =>handler.handleInteraction(i));
client.on("messageCreate", (message: Message)=>handler.handleMessage(message));
client.on('messageDelete',(deleted: Message| PartialMessage)=>sniper.saveDeletedMessage(deleted))
client.on('messageUpdate',(old: Message | PartialMessage, updated: Message | PartialMessage)=>sniper.saveEditedMessage(old, updated))
client.on('guildCreate', async guild => {
  const q = Connections.db.query('INSERT INTO guilds VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE id=id;', [guild.id, guild.name, '!!', 'es', null]);
  q.then(()=>console.log('Servidor nuevo registrado: ' + guild.name));
  q.catch((e: string)=>console.error(e));
  const [qr] = await Connections.db.query<RowDataPacket[]>('SELECT id FROM roles WHERE guild=?', [guild.id])
  const roles = qr.map((row: RowDataPacket)=>row.id)
  for (const role of guild.roles.cache.values()) {
    if(roles.includes(role.id)) continue;
    if(role.managed) continue;
    if(role.permissions.has('Administrator')) addAdminRole(role)
  }
  console.log("---------Fin adaptación a nuevo servidor------------")
});
client.on("guildDelete", guild=>{
  const q1 = Connections.db.query('DELETE FROM guilds WHERE id=?', [guild.id])
  q1.then(()=>console.log('Servidor ' + guild.name + ' eliminado de la database por ser eliminado de discord'));
  q1.catch((e: string)=>console.error(e));
  const q2 = Connections.db.query("DELETE FROM users WHERE guild=?", [guild.id])
  q2.then(()=>console.log('Registros de los miembros de' + guild.name + ' eliminados de la database por servidor eliminado de discord'));
  q2.catch((e: string)=>console.error(e));
  const q3 = Connections.db.query("DELETE FROM roles WHERE guild=?", [guild.id])
  q3.then(()=>console.log('Registros de roles' + guild.name + ' eliminados de la database por servidor eliminado de discord'));
  q3.catch((e: string)=>console.error(e));
})
client.on("roleCreate", (role: Role)=>{
  if(!role.permissions.has('Administrator')) return
  if(role.managed) return
  addAdminRole(role)
})
client.on("roleDelete", (role: Role)=>{
  const q = Connections.db.query("DELETE FROM roles WHERE id=?", [role.id])
  q.then(()=>console.log(`Rol ${role.name} (${role.id}), que fue eliminado de su servidor, eliminado de la database`))
  q.catch((e: string)=>console.error(e))
})
client.on("roleUpdate", (old_role: Role, new_role: Role) => {
  if(old_role.permissions.missing('Administrator') && new_role.permissions.has('Administrator'))
    addAdminRole(new_role);
})

client.on("error", e =>{
  console.error("Discord client error!", e)
  process.exit(1)
})


async function register(rest: REST, testing: boolean){
  try {
		console.log('Actualizando comandos de barra (/)');
    if(testing){
		await rest.put(
			Routes.applicationGuildCommands('708884260664246324', '706215432503164979'),
			{ body: commands },
		);
    }else{
      await rest.put(
        Routes.applicationCommands('685645806069612621'),
        { body: commands },
      );
    }

		console.log('Successfully reloaded application (/) commands.');
	} catch (error) {
		console.error(error);
	}
}

let rest

if(process.argv[2] == '-d'){
  if(!BETA_TOKEN){
    console.error("No hay token para bot experimental. Intente ejecutar `npm start`.")
    process.exit(1)
  }
  client.login(BETA_TOKEN).catch(e=>console.error(e))
  rest = new REST({ version: '10' }).setToken(BETA_TOKEN)
  register(rest, true)
}else{
  client.login(DISCORD_TOKEN).catch(e=>console.error(e));
  rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN || '');
  register(rest, false)
}


app.listen(PORT, () => console.log(`Server started on port ${PORT}!`))

function addAdminRole(role: Role){
  if(role.managed) return
  const q =Connections.db.query("INSERT INTO roles VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE id=id", [role.id, role.guild.id, 'adm', 0b01111111])
  q.then(()=>console.log(`Rol ${role.name} (${role.id}) de ${role.guild.name} agregado como rol de administrador`))
  q.catch((e: string)=>console.error(e))
}