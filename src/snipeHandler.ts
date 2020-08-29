const mysql = require('mysql');
import {PartialMessage} from 'discordjs'
export class SnipeHandler {
  private connection: any
  constructor(){
    const connection = mysql.createConnection(process.env.JAWSDB_MARIA_URL);

    connection.connect();
    this.connection = connection
    connection.query('SELECT 1 + 1 AS solution', function(err, rows, fields) {
      if (err) throw err;

      console.log('The solution is: ', rows[0].solution);
    });

  connection.end();
  }
  saveMessage(msg: PartialMessage):Promise<Void>{
    
  }
}