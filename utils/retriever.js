const { SupabaseVectorStore } = require('@langchain/community/vectorstores/supabase')
const { OpenAIEmbeddings } = require('@langchain/openai')
const { createClient } = require('@supabase/supabase-js')
//const OpenAIEmbeddings = require('@langchain/openai')
//const createClient =  require('@supabase/supabase-js')

const embeddings = new OpenAIEmbeddings()

const sbApiKey = process.env.SUPABASE_API_KEY
const sbUrl = process.env.SUPABASE_URL_LC_CHATBOT
const client = createClient(sbUrl,sbApiKey)

const vectorStore = new SupabaseVectorStore(embeddings, {
    client,
    tableName: 'ramallah_docs',
    queryName: 'match_ram_documents'
})

const retriever = vectorStore.asRetriever()

module.exports = retriever