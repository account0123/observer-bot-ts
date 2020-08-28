import ArgCommand from "./commandArgInterface";
import { Message, Permissions, MessageEmbed } from "discord.js";
import { RoleFinder } from "../util/RoleFinder";

export class CreateRoleCommand implements ArgCommand{
	commandNames: string[] = ['createrole', 'cr']
	requiredArgs: number = 1
	examples: string[] = ['\"rojo fuerte\" #ff0000 !verde oscuro', 'Admin #ffff00 0x7ffffff ^@Mods -hoist -mentionable', 'usuarios -hoist']
	usage:string = '<nombre del rol> [color] [permisos] [^rol inferior] [!rol superior] [-hoist] [-mentionable]'
	guildExclusive: boolean = true
	async run(msg: Message, args: string[]): Promise<void> {
		const bot = msg.guild!.member(msg.client.user!)
		if (!bot?.hasPermission(Permissions.FLAGS.MANAGE_ROLES)) {
			msg.reply('no tengo el permiso de gestionar roles, así que tampoco puedo crearlos')
			return
		}
		const arg = args.join(' ');
        // RegEx
        const nameEx = /^\w+(?:\s?\w)+/;
        const colorEx = /#[A-Fa-f0-9]{,6}/;
        const permsEx = /0x[A-Fa-f0-9]{1,6}/;
        const lroleEx = /\^\w+(\s?\w+?)+|\^(<&\d+>)|\^(\d+)/;
        const hroleEx = /!((\w+\s?)+)|!(<&\d+>)|!(\d+)/;
		const booleansEx = /-mentionable|-hoist/g;
		const name = arg.match(nameEx);
		if(!name) {
			msg.reply('no pude encontrar un nombre de rol, lo que es raro.')
			return
		}
        const color = (arg.match(colorEx) || ['DEFAULT']);
		let perms = parseInt(arg.match(permsEx)![0],16) || Permissions.DEFAULT
		let hrolematch = arg.match(hroleEx);
		var hroleinput = ""
		var lroleinput = ""
        if(hrolematch) hroleinput = hrolematch[1];
        let lrolematch = arg.match(lroleEx);
        if(lrolematch) lroleinput = lrolematch[1];
        const options = arg.match(booleansEx);
        var hoist = false;
        var mentionable = false;
        if (options != null) {
            hoist = options.includes('-hoist');
            mentionable = options.includes('-mentionable');
        }
        const data = {
            name: name[0],
            color: color[0],
            permissions: perms,
            hoist: hoist,
            mentionable: mentionable,
            position: 0,
        };
        // Evaluación
        var hrolepos = 0;
        var lrolepos = 0;
        if (hroleinput) {
            var hrole = RoleFinder.getRole(msg, hroleinput);
            if (!hrole){msg.reply('el rol superior no pudo ser encontrado');return;}
            hrolepos = hrole.position;
        }
        if(lroleinput){
            var lrole = RoleFinder.getRole(msg, lroleinput);
            if(!lrole) {msg.reply('el rol inferior no pudo ser encontrado');return;}
            lrolepos = lrole.position;
        }
        if(hrolepos > 0) data.position = hrolepos - 1;
		if(lrolepos > 0) data.position = lrolepos + 1;
		if (data.position >= bot.roles.highest.position) {
			msg.reply('el rol que vas a crear está igual o más alto que todos mis roles juntos, así que hasta aquí hemos llegado')
			return
		}
        // Ejecución
        msg.guild!.roles.create({data}).then((role) => {
            const relative = () => { if (hrolepos > 0) return 'Encima de'; if (lrolepos > 0) return 'Debajo de'; return '\u200B'};
            const rolerelative = () => { if (hrolepos > 0) return `${hrole} (${hrole!.position})`; if (lrolepos > 0) return `${lrole} (${lrole!.position})`; return '\u200B'}
            const embed = new MessageEmbed().setTitle('Detalles:')
                .addFields(
                    { name: 'Color:', value: role.hexColor, inline: true},
                    { name: 'Posición', value: role.position, inline: true},
                    { name: relative(), value: rolerelative(), inline: true},
                    { name: 'Permisos:', value: role.permissions.toArray()}
                    )
                .setTimestamp();
            msg.reply(`el rol ${role} fue creado sin problemas.`, embed)
        }).catch( (error) => {
			msg.reply('Error inesperado!!!')
			console.error(error)
		});
	}
	
}