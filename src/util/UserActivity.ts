import { User, Activity } from "discord.js";

export class UserActivity {
	private readonly activity: Activity | null
	constructor(user:User){
		var activities = user.presence.activities;
        if(activities.length == 0) this.activity = null;
        if (activities[0].type === 'CUSTOM_STATUS' && activities.length > 1)
            this.activity = activities[1];
        else this.activity = activities[0];
	}
	toString(): string{
		const a = this.activity;
		if (!a) {
			return '*Sin actividades.*'
		}
        switch (a.type) {
            case 'CUSTOM_STATUS':
                return '*Estado personalizado*';
            case 'PLAYING':
                return 'Jugando a ' + a.name;
            case 'STREAMING':
                return "[Transmitiendo](" + (a.url || '') + ")";
            case 'LISTENING':
                return 'Escuchando ' + a.name;
            case 'WATCHING':
                return 'Viendo ' + a.name;
        }
	}
}