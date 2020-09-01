/// <reference path="../../node_modules/@types/mysql/index.d.ts" />
import * as MySQL from "mysql"
import { Connection } from "mysql";

export class Connections {
	static connection: Connection
  constructor(){
    const connection = MySQL.createConnection(process.env.JAWSDB_MARIA_URL!)
  connection.connect();
  connection.query('ALTER TABLE deleted ALTER COLUMN content TEXT(2000);')
  connection.query('ALTER TABLE edited ALTER COLUMN content TEXT(2000);')
  connection.query('CREATE TABLE guilds (id varchar(24) not null,name varchar(100) not null,prefix varchar(4), language char(2));')
    Connections.connection = connection
  }
}