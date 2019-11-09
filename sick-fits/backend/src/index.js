require('dotenv').config({ path: '.env' });
const cookieParser = require('cookie-parser');
const createServer = require('./createServer');
const db = require('./db');

const server = createServer();

// INFO express middleware to handle cookies (JWT)

// cookieParser lets us access cookies in a formatted object rather than the cookie string
server.express.use(cookieParser());

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
