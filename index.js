
require('dotenv').config();
require('./src/middlewares/globalVars');

const express = require('express');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const v8 = require('node:v8');

const gg = require('./src/utils/myglobal');

//blacklist example
let blist = ['12.12.12.12', '89.89.89.89'];
for (const dr in blist) {
  if (!(global.blacklist[blist[dr]])) {
    let cachedata = {
      ip: blist[dr],
      counter: 1
    };
    global.blacklist[blist[dr]] = cachedata;
  }
}

//users example
let users = ['a@a.com', 'b@b.com'];
for (const dr in users) {
  console.log(users[dr]);
  if (!(global.users[users[dr]])) {
    let cachedata = {
      user: users[dr],
      pass: '1234'
    };
    global.users[users[dr]] = cachedata;
  }
}

// Middleware to check blacklist
function checkBlacklist(req, res, next) {
  req.getIP = req.header('x-forwarded-for') || req.socket.remoteAddress ? req.header('x-forwarded-for') || req.socket.remoteAddress : '0.0.0.0';
  if (req.getIP == '::1')
    req.getIP = '127.0.0.1';  
  if (global.blacklist[req.getIP]) {
    global.blacklist[req.getIP].counter++;    
    res.status(400).json(gg.returnDat(true, 400, 'Black Listed IP Address.', 'Counter ' + global.blacklist[req.getIP].counter));
  }
  else {
    next();
  }
}

async function startServer() {
  const PORT = process.env.PORT || 80;
  const app = express();
  // const httpServer = http.createServer(app);
  const server = http.createServer(app);

  //swagger documentations **********************************************************
  const swaggerOptions = {
    swaggerDefinition: {
      info: {
        title: 'Apollo Server',
        description: 'This API will help you to manage the backend for the application.',
        version: '2023.12.18 v1',
        termsOfService: 'http://swagger.io/terms/',
        contact: {
          email: 'roberto@buildersaccess.com'
        },
        license: {
          name: 'Apache 2.0',
          url: 'http://www.apache.org/licenses/LICENSE-2.0.html'
        }
      },
      // Add security definitions here if required (e.g., apiKey, bearerToken, etc.)
      securityDefinitions: {
        // using Bearer token authentication
        bearerAuth: {
          type: 'apiKey',
          name: 'Authorization',
          in: 'header',
        },
      },
    },
    apis: ['./src/api/**/*.js']
  };
  const swaggerDocs = swaggerJSDoc(swaggerOptions);
  app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

  // swagger api  **********************************************************
  const signup = require('./src/api/signup')(gg);  
  app.use('/api/signup', cors(), bodyParser.json(), bodyParser.urlencoded({ extended: false }), checkBlacklist, signup);

  app.get('/cache', (req, res) => {
    // Get the size (length) of the global variable array
    let numRecords = Object.keys(global.users).length;
    numRecords += Object.keys(global.blacklist).length;
    numRecords += Object.keys(global.cacheAttack1).length;
    let mbytes = 0;
    for (const dr in global.users) {
      const cachedata = global.users[dr];
      mbytes += v8.serialize(cachedata).length;
    }
    for (const dr in global.blacklist) {
      const cachedata = global.blacklist[dr];
      mbytes += v8.serialize(cachedata).length;
    }
    for (const dr in global.cacheAttack1) {
      const cachedata = global.cacheAttack1[dr];
      mbytes += v8.serialize(cachedata).length;
    }
    res.send('>> Records << ' + numRecords + ' >>  Size in Bytes << ' + mbytes + ' >>');
  });



  app.use(express.static('public'));

  await new Promise((resolve) => {
    server.listen({ port: PORT }, () => {
      console.log(`🚀 Server ready at http://localhost:${PORT}/swagger`);
      resolve(); // Resolve the Promise after successful server start
    });
  });

}
startServer();

