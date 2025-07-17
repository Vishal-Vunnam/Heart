import * as sql from 'mssql';
import * as dotenv from 'dotenv';
dotenv.config();

const { AZURE_SQL_CONNECTION_STRING } = process.env;

if (!AZURE_SQL_CONNECTION_STRING) {
  throw new Error('Missing AZURE_SQL_CONNECTION_STRING environment variable.');
}

export const poolPromise = new sql.ConnectionPool(AZURE_SQL_CONNECTION_STRING)
  .connect()
  .then(pool => {
    console.log('Connected to MSSQL');
    return pool;
  })
  .catch(err => console.log('Database Connection Failed! Bad Config: ', err));