require('dotenv').config({ path: '.env' });
const cookieParser = require('cookie-parser');
const createServer = require('./createServer');
const db = require('./db');
const jwt = require('jsonwebtoken');

const server = createServer();

// INFO express middleware to handle cookies (JWT)

// cookieParser lets us access cookies in a formatted object rather than the cookie string
server.express.use(cookieParser());

// decode the JWT so we can get the userID
server.express.use((req, res, next) => {
  const { token } = req.cookies;
  if (token) {
    const { userId } = jwt.verify(token, process.env.APP_SECRET);
    // put the userId onto the req for future requests to access
    req.userId = userId;
  }
  next();
});

// TODO use express middleware to populate current user

server.start(
	{
		cors: {
			credentials: true,
			origin: process.env.FRONTEND_URL
		}
	},
	deets => {
		console.log(`Server is now running on port http://localhost:${deets.port}`);
	}
);
