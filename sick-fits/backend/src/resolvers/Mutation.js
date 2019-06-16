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
	}
};

module.exports = mutations;
