const { SupabaseVectorStore } = require("@langchain/community/vectorstores/supabase")
const { OpenAIEmbeddings, OpenAI, ChatOpenAI } = require("@langchain/openai")
const { createClient } = require("@supabase/supabase-js")
const fs = require("fs")
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter")
const {PromptTemplate} = require('@langchain/core/prompts')
const {StringOutputParser} = require('@langchain/core/output_parsers')
const {RunnableSequence,RunnablePassthrough} = require("@langchain/core/runnables")
const { ContextualCompressionRetriever } = require("langchain/retrievers/contextual_compression");
const { LLMChainExtractor } = require("langchain/retrievers/document_compressors/chain_extract");
const { DocxLoader } = require("@langchain/community/document_loaders/fs/docx");
//const { combineDocuments } = require("./utils/combineDocuments")
//const { retriever } = require("./utils/retriever")

const sbApiKey = process.env.SUPABASE_API_KEY
const sbUrl = process.env.SUPABASE_URL_LC_CHATBOT


async function splitText()
{
    try {
        const loader = new DocxLoader(
          "./ramallah.docx"
        );
        
        const docs = await loader.load();
        const splitter = new RecursiveCharacterTextSplitter({
          chunkSize: 200,
          chunkOverlap: 50,
        })
        
        const output = await splitter.splitDocuments(docs)
        const client = createClient(sbUrl, sbApiKey)
        await SupabaseVectorStore.fromDocuments(
          output,
          new OpenAIEmbeddings(),
          {
            client,
            tableName: 'ramallah_docs',
          }
        )
        return output

      } catch (err) {
        console.log(err)
        return err;
      }
}

async function retrieve(question, convHistory)
{
  const llm = new ChatOpenAI()
// const model = new OpenAI({
//   model: "gpt-3.5-turbo-instruct",
// });
// const baseCompressor = LLMChainExtractor.fromLLM(model);

// const retriever = new ContextualCompressionRetriever({
//   baseCompressor,
//   baseRetriever: vectorStore.asRetriever(),
// });
const embeddings = new OpenAIEmbeddings()
const client = createClient(sbUrl,sbApiKey)

const vectorStore = new SupabaseVectorStore(embeddings, {
    client,
    tableName: 'ramallah_docs',
    queryName: 'match_ram_documents'
})

const retriever = vectorStore.asRetriever()

const standaloneQuestionTemplate = `Given some conversation history (if any) and a question, convert the question to a standalone question. 
conversation history: {conv_history}
question: {question} 
standalone question:`
const standaloneQuestionPrompt = PromptTemplate.fromTemplate(standaloneQuestionTemplate)

const answerTemplate = `You are a helpful and enthusiastic support bot who can answer a given question about Scrimba based on the context provided and the conversation history. Try to find the answer in the context. If the answer is not given in the context, find the answer in the conversation history if possible. If you really don't know the answer, say 
"آسف لا اعرف الاجابة على سؤالك" 
And direct the questioner to email alaa.shabaneh@gmail.com. Don't try to make up an answer. Always speak as if you were chatting to a friend.
context: {context}
conversation history: {conv_history}
question: {question}
answer: `
const answerPrompt = PromptTemplate.fromTemplate(answerTemplate)

const standaloneQuestionChain = standaloneQuestionPrompt
    .pipe(llm)
    .pipe(new StringOutputParser())
    
    const retrieverChain = RunnableSequence.from([
      prevResult => prevResult.standalone_question,
      retriever,
      combineDocuments
  ])


const answerChain = answerPrompt
    .pipe(llm)
    .pipe(new StringOutputParser())

const chain = RunnableSequence.from([
      {
          standalone_question: standaloneQuestionChain,
          original_input: new RunnablePassthrough()
      },
      {
          context: retrieverChain,
          question: ({ original_input }) => original_input.question,
          conv_history: ({ original_input }) => original_input.conv_history
      },
      answerChain
  ])

const response = await chain.invoke({
    question: question,
    conv_history: formatConvHistory(convHistory)
})


return response;
}

function formatConvHistory(messages) {
  return messages.map((message, i) => {
      if (i % 2 === 0){
          return `Human: ${message}`
      } else {
          return `AI: ${message}`
      }
  }).join('\n')
}
function combineDocuments(docs){
    return docs.map((doc)=>doc.pageContent).join('\n\n')
}

module.exports = { splitText, retrieve }; 
