/// <reference path="../../node_modules/@types/mysql/index.d.ts" />
import * as MySQL from "mysql"
import { Connection } from "mysql";
import { Client } from "discord.js";

export class Connections {
	static db: Connection
  constructor(client:Client){
    const connection = MySQL.createConnection(process.env.JAWSDB_MARIA_URL!)
  connection.connect();
  console.log('Database conectada')
  checkGuilds(client,connection)
  Connections.db = connection
  }
}
function checkGuilds(client:Client,sql:Connection){
  console.log('Todo OK')
}
