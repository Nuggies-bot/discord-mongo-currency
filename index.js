const mongoose = require('mongoose');
const currencyModel = require('./models/CurrencyModel');

class DiscordCurrency {
    /**
     * @param {object} options - Manager Options
     */
    
    constructor(options) {
        if (!options.url) throw new Error('No connection string was provided.');
        this.cache = new Map();
        this.url = options.url;
        mongoose.connect(this.url, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    }

    /**
     * @param {String} userId - Discord user ID
     * @param {String} guildId - Discord guild ID 
     */
    
    async findUser(userId, guildId) {
        if (!userId) throw new Error('No user ID was provided');
        if (!guildId) throw new Error('No guild ID was provided');
        
        let user = this.cache.get(`${userId}_${guildId}`);
        if (!user) {
            let e = await currencyModel.findOne({ userId: userId, guildId: guildId });
            if (!e) {
                e = await currencyModel.create({
                    userId: userId,
                    bankSpace: 1000,
                    coinsInBank: 0,
                    coinsInWallet: 0
                });
            }
            
            user = e;
            this.cache.set(`${userId}_${guildId}`, user);
        }
        
        return user;
    }

    /**
     * 
     * @param {string} userId - A discord user ID.
     * @param {number} amount - Amount of coins to give.
     */
    
    static async giveCoins(userId, amount) {
        if (!userId) throw new TypeError("You didn't provide a user ID.");
        if (!amount) throw new TypeError("You didn't provide an amount of coins.");
        if (isNaN(amount)) throw new TypeError("The amount must be a number.");
        if (amount < 0) throw new TypeError("New amount must not be under 0.");

        let user = await currencyModel.findOne({ userId: userId });

        if (!user) {
            const newData = new currencyModel({
                userId: userId,
                fridgeSpace: 1000,
                fridge: 0,
                nuggets: parseInt(amount)
            });

            await newData.save()
            .catch(err => console.log(err));
            
            return amount;
        }

        user.nuggets += parseInt(amount);

        await user.save()
        .catch(err => console.log(err));

        return amount;
    }

    /**
     * 
     * @param {string} userId - A discord user ID.
     * @param {string} amount - Amount of coins to deduct.
     */

    static async deductCoins(userId, guildId, amount) {
        if (!userId) throw new TypeError("You didn't provide a user ID.");
        if (!amount) throw new TypeError("You didn't provide an amount of coins.");
        if (isNaN(amount)) throw new TypeError("The amount must be a number.");
        if (amount < 0) throw new TypeError("New amount must not be under 0.");

        let user = await currencyModel.findOne({ userId: userId });

        if (!user) {
            const newData = new currencyModel({
                userId: userId,
                fridgeSpace: 1000,
                fridge: 0,
                nuggets: 0
            });

            await newData.save()
            .catch(err => console.log(err));
            
            return amount;
        }

        if (amount > user.nuggets) {
            user.nuggets -= user.nuggets;

            await user.save()
            .catch(err => console.log(err));

            return amount;
        }

        user.nuggets -= parseInt(amount);

        await user.save()
        .catch(err => console.log(err));

        return amount;
    }

    /**
     * 
     * @param {string} userId - A discord user ID.
     * @param {string} amount - Amount of bank space to give.
     */
    
    static async giveBankSpace(userId, amount) {
        if (!userId) throw new TypeError("You didn't provide a user ID.");
        if (!amount) throw new TypeError("You didn't provide an amount of coins.");
        if (isNaN(amount)) throw new TypeError("The amount must be a number.");
        if (amount < 0) throw new TypeError("New amount must not be under 0.");

        let user = await currencyModel.findOne({ userId: userId });

        if (!user) {
            let newData = new currencyModel({
                userId: userId,
                fridgeSpace: 1000 + parseInt(amount),
                fridge: 0,
                nuggets: 0
            });

            await newData.save()
            .catch(err => console.log(err));

            return amount;
        }

        user.fridge += parseInt(amount);

        await user.save()
        .catch(err => console.log(err));

        return amount;
    }

    /**
     * 
     * @param {string} userId - A discord user ID.
     */

    static async createUser(userId) {
        if (!userId) throw new TypeError("Please provide a user ID.");

        let user = await currencyModel.findOne({ userId: userId });
        if (user) return false;

        let newData = new currencyModel({
            userId: userId,
            fridgeSpace: 1000,
            fridge: 0,
            nuggets: 0
        });

        await newData.save()
        .catch(err => console.log(err));
    }

    /**
     * 
     * @param {string} userId - A discord user ID.
     */

    static async deleteUser(userId) {
        if (!userId) throw new TypeError("Please provide a user ID.");

        let user = await currencyModel.findOne({ userId: userId });
        if (!user) return false;

        await currencyModel.findOneAndRemove({ userId: userId });

        await user.save()
        .catch(err => console.log(err));
    }

    /**
     * 
     * @param {String} userId
     * @param {Object} item 
     * @param {Number} amount 
     */
    static async addItem(userId, item, amount) {
        if(!item) throw new TypeError('Please provide an item');
        if(!amount) throw new TypeError('Please provide an amount');
        if(isNaN(amount)) throw new TypeError('Please provide a valid amount');

        let user = await currencyModel.findOne({ userId: userId});

        if(!user) return false;

        let useritem = user.inventory.find(i => i.name === item)
        if(useritem) useritem.amount += amount;
        else useritem = user.inventory.push(item);
        user.save();
    }

    static async addBadge(userId, badge) {
        if(!userId) throw new TypeError('Please provide a user ID');
        if(!badge) throw new TypeError('Please provide a badge');

        let user = await currencyModel.findOne({ userId: userId });

        if(!user) return false;

        const Badge = user.badges.find(b => b === badge);
        if(!Badge) user.badges.push(badge)
        else return false;
        
        user.save();
    }

    /**
     * 
     * @param {String} userId
     * @private
     * @returns {Promise<mongoose.Document[]>} Promise<mongoose.Document[]>
     * @description Gives all the data saved in database
     */

    static async _get() {
        let user = await currencyModel.find();

        if(!user) return false;
        return user;
    }

    /**
     * 
     * @param {String} userId
     * @param {mongoose.Document} data
     * @private
     * @description Use the _get method to get the data, modify it and save/update it using this method.
     */

    static async _update(userId, data) {
        if(!userId) throw new TypeError('Please provide a valid user ID.');
        if(!data) throw new TypeError('Please provide data to update.');
        let user = await currencyModel.findOne({ userId: userId });
        if(!user) return false;

        user.updateOne(data);
    }
}

module.exports = mongoCurrency;
