require("dotenv/config");

 const openai = require("@langchain/openai");
 const human = require("@langchain/core/messages");
 const parse  = require("@langchain/core/output_parsers")
 //const OPENAI_API_KEY = 'sk-proj-ba6bNWpyktxWBUAxdGwmT3BlbkFJ9GSJsx6fZ04khoM8j6Vt';

async function generateResponse(question){
    const model = new openai.ChatOpenAI({
        modelName: "gpt-3.5-turbo-16k"
    });
    const parser = new parse.StringOutputParser()
    const result = await model.invoke([
        new human.HumanMessage(question)
    ]);
    const response = await parser.invoke(result);
    return response;
}
function greet(name) {
    return `Hello, ${name}!`;
  }
  
  module.exports = generateResponse;
  //module.exports = greet;s