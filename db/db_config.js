const config = {
    postgresConnectionOptions: {
      type: "postgres",
      host: "localhost",
      port: 5432,
      user: "postgres",
      password: "postgres",
      database: "chatbot_db",
    },
    tableName: "ramallah_docs",
    columns: {
      idColumnName: "id",
      vectorColumnName: "embedding",
      contentColumnName: "content",
      metadataColumnName: "metadata",
    },
    // supported distance strategies: cosine (default), innerProduct, or euclidean
    distanceStrategy: "cosine",
  };
  module.exports = config;
