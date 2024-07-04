const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const generateResponse = require('./llm');
const cors = require('cors');
const { splitText, retrieve, queryFromText } = require('./llm2');
const load = require('./document_loader');
const app = express();

const port = 3000;

const allowedOrigins = ['http://localhost:3000', 'http://localhost:46897', 'null'];
// Define CORS options
// const corsOptions = {
//   origin: 'http://localhost:46897',
//   credentials: true // Allow credentials (cookies) to be sent
// };
//app.use(cors(corsOptions));
app.use(cors({
  origin: function(origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
          const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
          return callback(new Error(msg), false);
      }
      return callback(null, true);
  },
  credentials: true // Enable credentials (cookies, authorization headers) across domains
}));
app.use(cookieParser());
app.use(session({
  secret: 'conv_history',  // Replace with a strong secret key
  resave: false,              // Forces the session to be saved back to the session store
  saveUninitialized: true,    // Forces a session that is "uninitialized" to be saved to the store
  cookie: { secure: false }
}))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', async (req, res) => { 
  //const result = await splitText()
  res.send("Hello welcome to AI chatbot application!");
})

app.get('/split', async (req, res) => {
  const result = await splitText()
  res.send(result)
})

app.get('/load',async(req,res) => {
  const result = await load()
  res.send(result);
})

app.get('/response',async (req,res) => {
  const params = req.query;
  const result = await generateResponse(params.question);
  res.send(result)
})

app.get('/retreive', async (req,res) => {
  const params = req.query;
  var question = params.question
  //var human = {Human: question};
  // Initialize the array in the session if it doesn't exist
  if (!req.session.myArray) {
    req.session.myArray = [];
    console.log('Session array initialized.');
  }
  req.session.myArray.push(question);
  const result = await retrieve(params.question, req.session.myArray)
//var ai = {AI: result}
  req.session.myArray.push(result)
 console.log(`Session retrieved: ${req.session.myArray}`);

// Save the session
req.session.save((err) => {
  if (err) {
    return res.status(500).send('Error saving session');
  }
  // Respond to the client
  res.send(result);
});
})

// Route to push the next sequential number to the session array
app.get('/push-sequent', (req, res) => {
  // Initialize the array in the session if it doesn't exist
  if (!req.session.myArray) {
    req.session.myArray = [];
    console.log('Session array initialized.');
  }
  const params = req.query;
  var question = params.question
  // Determine the next sequential number
  const nextNumber = req.session.myArray.length > 0 ? req.session.myArray[req.session.myArray.length - 1] + 1 : 1;
  
  // Push the next sequential number to the session array
  req.session.myArray.push(question);
  console.log(`Next sequential number ${nextNumber} added to session array.`);
  
  // Save the session
  req.session.save((err) => {
    if (err) {
      console.error('Error saving session:', err);
      return res.status(500).send('Error saving session');
    }
    console.log('Session saved successfully.');
    res.send(`Next sequential number ${nextNumber} added to array.`);
  });
});

// Route to retrieve the session array
app.get('/get-array', (req, res) => {
  const sessionArray = req.session.myArray || [];
  console.log('Session array retrieved:', sessionArray);
  res.json(sessionArray);
});

// Example route to set a session value
app.get('/set-session', (req, res) => {
  req.session.name = 'Hi, I am Alaa';
  console.log(`Session set: ${req.session.name}`);
  res.send('Session value set');
});

// Example route to get a session value
app.get('/get-session', (req, res) => {
  console.log(`Session retrieved: ${req.session.convHistory}`);
  const sessionValue = req.session.convHistory;
  res.send(`Session value: ${sessionValue}`);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})