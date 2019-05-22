const mutations = {
	async createItem(parent, args, ctx, info) {
		//TODO: check if they're logged in

		// we have access to the db inside ctx,
		// bc we passed it in createServer.js
		const item = await ctx.db.mutation.createItem(
			{
				data: {
					...args
				}
			},
			info
		);

		return item;
	}
};

module.exports = mutations;
