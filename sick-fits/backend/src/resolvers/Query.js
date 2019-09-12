const { forwardTo } = require('prisma-binding');

const Query = {
	items: forwardTo('db'),
	item: forwardTo('db'),
	itemsConnection: forwardTo('db')

	// async items(parent, args, ctx, info) {
	// 	return ctx.db.query.items();
	// }

	// dogs(parent, args, ctx, info) {
	// 	global.dogs = global.dogs || [];
	// 	return global.dogs;
	// }
};

module.exports = Query;
