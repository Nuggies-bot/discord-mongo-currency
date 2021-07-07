const mongoose = require('mongoose');

const CurrencySchema = new mongoose.Schema({
	userId: { type: String, required: true },
	nuggets: { type: Number, default: 0 },
	fridge: { type: Number, default: 0 },
	fridgeSpace: { type: Number, default: 2000 },
	inventory: [
		{ type: Object, default: {} },
	],
	factoryLevel: { type: Number, default: 1 },
	userLevel: { type: Number, default: 0 },
	userXp: { type: Number, default: 0 },
	badges: { type: Array, default: [] },
	netValue: { type: Number, default: null },
});

module.exports = mongoose.model('currency', CurrencySchema);
