import 'dotenv/config';
import * as path from 'path';
import { DataSource } from 'typeorm';

const localDb: boolean = process.env.DB_HOST === 'localhost';
const host = process.env.DB_HOST;
const user = process.env.DB_USERNAME;
const database = process.env.DB_DATABASE;
const password = process.env.DB_PASSWORD;

const AppDataSource = new DataSource({
  type: 'postgres',
  host: host,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: user,
  password: password,
  database: database,
  synchronize: false,
  logging: false,
  entities: [path.join(__dirname, '../src/models/*.{ts,js}')],
  migrations: [path.join(__dirname, './migrations/*.{ts,js}')],
  extra: localDb
    ? {
        connectionLimit: 50,
      }
    : {
        connectionLimit: 50,
        ssl: { rejectUnauthorized: true },
      },
});

// const AppDataSource = new DataSource({
//   type: 'mysql',
//   host: host,
//   port: parseInt(process.env.DB_PORT || '3306', 10),
//   username: user,
//   password: password,
//   database: database,
//   synchronize: false,
//   logging: false,
//   entities: [path.join(__dirname, '../src/models/*.{ts,js}')],
//   migrations: [path.join(__dirname, './migrations/*.{ts,js}')],
//   extra: localDb
//     ? {
//         connectionLimit: 50,
//       }
//     : {
//         connectionLimit: 50,
//         ssl: { rejectUnauthorized: true },
//       },
// });

export default AppDataSource;
