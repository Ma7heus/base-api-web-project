/* eslint-disable */

import 'dotenv/config';
import { DataSource } from 'typeorm';
import AppDataSource from './ormconfig';

export const getDataSource = async (): Promise<DataSource> => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  return AppDataSource;
};

async function initDatabase() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('Banco de dados conectado com sucesso!');
    }
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
    throw error;
  }
}

async function executeQuery<T = any>(
  sqlQuery: string,
  parameters?: any[],
): Promise<T[]> {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    const result = await AppDataSource.query(sqlQuery, parameters || []);
    return result as T[];
  } catch (error) {
    console.error('Erro ao executar query:', error);
    throw error;
  }
}

async function getDatabaseVersion(): Promise<string> {
  try {
    const result = await executeQuery<{ version: string }>('SELECT version()');
    return result[0].version; // PostgreSQL retorna 'version' como chave
  } catch (error: any) {
    throw new Error(`Error getting database version: ${error.message}`);
  }
}

async function maxConnections(): Promise<number> {
  try {
    const result = await executeQuery<{ max_connections: string }>(
      'SHOW max_connections',
    );
    return parseInt(result[0].max_connections, 10);
  } catch (error: any) {
    throw new Error(`Error getting max connections: ${error.message}`);
  }
}

async function getConnections(): Promise<number> {
  try {
    const result = await executeQuery<{ connections: string }>(
      'SELECT count(*) AS connections FROM pg_stat_activity',
    );
    return parseInt(result[0].connections, 10);
  } catch (error: any) {
    throw new Error(`Error getting current connections: ${error.message}`);
  }
}

async function databaseName(): Promise<string> {
  try {
    const result = await executeQuery<{ current_database: string }>(
      'SELECT current_database()',
    );
    return result[0].current_database;
  } catch (error: any) {
    throw new Error(`Error getting database name: ${error.message}`);
  }
}

async function countAppliedMigrations(): Promise<number> {
  try {
    const result = await executeQuery<{ applied_migrations: string }>(
      'SELECT COUNT(*) AS applied_migrations FROM migrations',
    );
    return parseInt(result[0].applied_migrations, 10);
  } catch (error: any) {
    throw new Error(`Error counting applied migrations: ${error.message}`);
  }
}

export default {
  databaseName,
  initDatabase,
  executeQuery,
  maxConnections,
  getConnections,
  getDatabaseVersion,
  countAppliedMigrations,
};
