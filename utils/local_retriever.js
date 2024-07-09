const { OpenAIEmbeddings } = require("@langchain/openai");
const {
  DistanceStrategy,
  PGVectorStore,
} = require("@langchain/community/vectorstores/pgvector");
const pg = require('pg');
const { PoolConfig } = require('pg');
const config = require("../db/db_config");
const { postgresConnectionOptions, tableName, columns, distanceStrategy } = config;
const pool = new pg.Pool(postgresConnectionOptions);
const pgVectorConfig = {
    pool: pool,
    tableName,
    columns,
    distanceStrategy,
  };
  const pgvectorStore = new PGVectorStore(
    new OpenAIEmbeddings(),
    pgVectorConfig,
  );

  const myRetriever = pgvectorStore.asRetriever()
  module.exports = myRetriever;

