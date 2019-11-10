const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const { promisify } = require('util');

const mutations = {
	async createItem(parent, args, context, info) {
		//TODO: check if they're logged in

		// we have access to the db inside ctx,
		// bc we passed it in createServer.js
		const item = await context.db.mutation.createItem(
			{
				data: {
					...args
				}
			},
			info
		);

		return item;
	},
	updateItem(parent, args, context, info) {
		// first  take a copy of the updates
		const updates = { ...args };
		// remove the id from the updates
		delete updates.id;
		// run the update method
		// context in the request => exposed prisma db => all the generated mutations =>
		return context.db.mutation.updateItem(
			{
				data: updates,
				where: {
					id: args.id
				}
			},
			info // this way the fn will know what to return
		);
	},
	async deleteItem(parent, args, context, info) {
		const where = { id: args.id };
		// 1. find the item
		const item = await context.db.query.item({ where }, `{ id title }`);
		// 2. check if they own that item, or have the permissions
		// TODO
		// 3. delete it
		return context.db.mutation.deleteItem({ where }, info);
	},
	async signup(parent, args, context, info) {
		// lowercase the email address
		args.email = args.email.toLowerCase();
		// hash the password, second param is SALT length
		const password = await bcrypt.hash(args.password, 10);
		//create the user in the DB
		const user = await context.db.mutation.createUser({
			data: {
				...args,
				password,
				permissions: { set: ['USER'] },
			}
		}, info);
		// create the JWT token
		const token = jwt.sign({userId: user.id}, process.env.APP_SECRET);
		// set JWT as a cookie in the response
		context.response.cookie('token', token, {
			httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year cookie
		});
		//return user to the browser
		return user;
	},
	async signin(parent, { email, password }, ctx, info) {
    // 1. check if there is a user with that email
    const user = await ctx.db.query.user({ where: { email } });
    if (!user) {
      throw new Error(`No such user found for email ${email}`);
    }
    // 2. Check if their password is correct
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error('Invalid Password!');
    }
    // 3. generate the JWT Token
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    // 4. Set the cookie with the token
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });
    // 5. Return the user
    return user;
	},
	signout(parent, args, ctx, info) {
		ctx.response.clearCookie('token');
		return { message: 'Goodbye!'}
	},
	async requestReset(parent, args, ctx, info) {
    // 1. Check if this is a real user
    const user = await ctx.db.query.user({ where: { email: args.email } });
    if (!user) {
      throw new Error(`No such user found for email ${args.email}`);
	}
    // 2. Set a reset token and expiry on that user
    const randomBytesPromiseified = promisify(randomBytes);
    const resetToken = (await randomBytesPromiseified(20)).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now
    const res = await ctx.db.mutation.updateUser({
      where: { email: args.email },
      data: { resetToken, resetTokenExpiry },
    });
    // 3. Email them that reset token
    // const mailRes = await transport.sendMail({
    //   from: 'wes@wesbos.com',
    //   to: user.email,
    //   subject: 'Your Password Reset Token',
    //   html: makeANiceEmail(`Your Password Reset Token is here!
    //   \n\n
    //   <a href="${process.env
    //     .FRONTEND_URL}/reset?resetToken=${resetToken}">Click Here to Reset</a>`),
    // });

		// 4. Return the message
		console.log(res);
    return { message: 'Thanks!' };
	},
};

module.exports = mutations;
