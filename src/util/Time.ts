import { SnowflakeUtil } from "discord.js"

export class Time {
	private readonly date: Date | null
	constructor(snowflake: string| Date| null){
		if (typeof snowflake == 'string') {
			this.date = SnowflakeUtil.deconstruct(snowflake).date
		}else{
			this.date = snowflake
		}
	}
	toString(): string{
		if (this.date === null) {
			return '*Fecha desconocida*'
		}
		return this.getDay(this.date.getDay()) + ', ' + this.date.getDate() + ' de ' + this.getMonth(this.date.getMonth()) + ' del ' + this.date.getFullYear() + ', a las ' + this.date.toTimeString()
	}
	private getDay(day:number):string{
		switch (day) {
            case 0:
                return 'Lunes';
            case 1:
                return 'Martes';
            case 2:
                return 'Miércoles';
            case 3:
                return 'Jueves';
            case 4:
                return 'Viernes';
            case 5:
                return 'Sábado';
            case 6:
				return 'Domingo';
			default:
				return 'desconocido'
        }
	}
	private getMonth(month:number):string{
		switch (month) {
			case 0:
				return 'enero'
			case 1:
				return 'febrero'
			case 2:
				return 'marzo'
			case 3:
				return 'abril'
			case 4:
				return 'mayo'
			case 5:
				return 'junio'
			case 6:
				return 'julio'
			case 7:
				return 'agosto'
			case 8:
				return 'septiembre'
			case 9:
				return 'octubre'
			case 10:
				return 'noviembre'
			case 11:
				return 'diciembre'
			default:
				return 'desconocido'
		}
	}
}