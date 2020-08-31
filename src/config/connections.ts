/// <reference path="../../node_modules/@types/mysql/index.d.ts" />
import * as MySQL from "mysql"
import { Connection } from "mysql";

export class Connections {
	static connection: Connection
  constructor(){
    const connection = MySQL.createConnection(process.env.JAWSDB_MARIA_URL!)
	connection.connect();
    Connections.connection = connection
  }
}