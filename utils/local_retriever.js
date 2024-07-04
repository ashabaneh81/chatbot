const { OpenAIEmbeddings } = require("@langchain/openai");
const {
  DistanceStrategy,
  PGVectorStore,
} = require("@langchain/community/vectorstores/pgvector");
const pg = require('pg');
const { PoolConfig } = require('pg');

const config = {
    postgresConnectionOptions: {
      type: "postgres",
      host: "localhost",
      port: 5432,
      user: "postgres",
      password: "123456",
      database: "postgres",
    },
    tableName: "ramallah_docs",
    queryName: "match_ram_documents",
    columns: {
      idColumnName: "id",
      vectorColumnName: "embedding",
      contentColumnName: "content",
      metadataColumnName: "metadata",
    },
    // supported distance strategies: cosine (default), innerProduct, or euclidean
    distanceStrategy: "cosine",
  };
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

