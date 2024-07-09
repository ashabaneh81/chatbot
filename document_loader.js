const { OpenAIEmbeddings } = require("@langchain/openai");
const {
  DistanceStrategy,
  PGVectorStore,
} = require("@langchain/community/vectorstores/pgvector");
const { PoolConfig } = require("pg");
const { DocxLoader } = require("@langchain/community/document_loaders/fs/docx");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const config = require("./db/db_config");

async function load()
{
    const pgvectorStore = await PGVectorStore.initialize(
        new OpenAIEmbeddings(),
        config
      );
      const loader = new DocxLoader(
        "./ramallah.docx"
      );
      
      const docs = await loader.load();
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 200,
        chunkOverlap: 50,
      })
      
      const output = await splitter.splitDocuments(docs);
      await pgvectorStore.addDocuments(output);
  



      return "document loaded";
}
async function answer()
{
  const llm = new ChatOpenAI()
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
  
  
}
module.exports = load
