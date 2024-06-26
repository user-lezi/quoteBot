const { User, ChannelType, EmbedBuilder } = require("discord.js");

class Quote {
  constructor(user, content) {
    this.content = content;
    this.author = user;
    let id = user.id;
    /* 0xFF FF FF FFF  */
    /*   a  b  c  d    */
    /* 
     a = Sum of digits of user id
     b = random integer between 0 - 255
     c = last two digits of user id
     d = time in ms % 0xFFF
    */
    let a = sumDigits(id);
    if (a > 0xff) {
      a = sumDigits(a);
    }

    let b = Math.floor(Math.random() * 0xff);
    let c = id.toString().slice(-2);
    let d = Date.now() % (0xfff + 1);
    this.id =
      a.toString(16).padStart(2, "0") +
      b.toString(16).padStart(2, "0") +
      c.toString(16).padStart(2, "0") +
      d.toString(16).padStart(3, "0");
  }
}

function sumDigits(n) {
  return n
    .toString()
    .split("")
    .reduce((a, b) => a + parseInt(b), 0);
}

class QuoteHelper {
  #client;
  constructor(client) {
    this.#client = client;
    this.databases = {
      users: client.defaults.guilds.usersDB,
      quotes: client.defaults.guilds.quotesDB,
    };
    this.maxQuotesPerMessage = 30;
  }

  get client() {
    return this.#client;
  }
  get userDB() {
    /* Returns the user DB Guild */
    return this.client.guilds.cache.get(this.databases.users);
  }
  get quoteDB() {
    /* Returns the quote DB Guild */
    return this.client.guilds.cache.get(this.databases.quotes);
  }

  async getUserQuotes(user) {
    let channel = this.getUserChannel(user);
    if (!channel) return [];
    let quoteIds = [];
    let channelTopic = channel.topic;
    if (!channelTopic) return [];
    let QuoteIdsMessages = channelTopic.split(" ");
    for (let id of QuoteIdsMessages) {
      let message = await channel.messages.fetch(id);
      let messageContent = message.embeds[0].data.description;
      if (!messageContent) continue;
      let foundIds = messageContent.split(" ");
      if (!foundIds.length) continue;
      for (let found of foundIds) {
        quoteIds.push({
          id: found,
          message: id,
        });
      }
    }
    return quoteIds;
  }
  async getQuote(quoteId) {
    let quoteChannel = this.getQuoteChannel(quoteId);
    if (!quoteChannel) return null;
    let topic = quoteChannel.topic;
    let parsedTopic = JSON.parse(topic);
    let quoteMessage = await quoteChannel.messages.fetch(parsedTopic.content);
    let quoteContent = quoteMessage.content;

    let user = await this.client.users.fetch(parsedTopic.author);

    return {
      time: parsedTopic.time,
      content: quoteContent,
      author: user,
      id: quoteId,
      views: parsedTopic.views,
      message: quoteMessage,
      channel: quoteChannel,
    };
  }
  async addView(quoteId) {
    let quote = await this.getQuote(quoteId);
    if (!quote) return null;
    quote.views++;
    let topic = {
      content: quote.message.id,
      author: quote.author.id,
      time: quote.time,
      views: quote.views,
    };
    await quote.channel.setTopic(JSON.stringify(topic));
    return quote;
  }

  async quoteCount(user) {
    if (!(user instanceof User)) return 0;
    let userQuotes = await this.getUserQuotes(user);
    return userQuotes.length;
  }
  async allQuoteCount() {
    let allQuotes = this.quoteDB.channels.cache.size;
    return allQuotes;
  }
  async allQuoteIds() {
    return this.quoteDB.channels.cache.map((c) => c.name);
  }
  async allQuotes() {
    let allQuotes = [];
    let allQuoteIds = await this.allQuoteIds();
    for (let id of allQuoteIds) {
      let quote = await this.getQuote(id);
      if (!quote) continue;
      allQuotes.push(quote);
    }
    return allQuotes;
  }

  async createQuote(user, content) {
    if (!(user instanceof User)) return false;
    if (!content) return false;

    let quote = new Quote(user, content);
    let quoteId = quote.id;
    let quoteChannel = await this.createQuoteChannel(quote);

    let userChannel = this.getUserChannel(user);
    if (!userChannel) userChannel = await this.createUserChannel(user);

    let topic = userChannel.topic;
    let quoteIds = await this.getUserQuotes(user);
    if (quoteIds.length >= this.maxQuotesPerMessage) {
      let message = await userChannel.send({
        content: `Quotes of <@${user.id}> [https://www.discord.com/users/${user.id}]`,
        embeds: [
          new EmbedBuilder()
            .setTitle("Quote IDs")
            .setColor(this.client.defaults.colors.main),
        ],
      });
      topic += " " + message.id;
      quoteIds.push({
        id: quoteId,
        message: message.id,
      });
      await userChannel.setTopic(topic);
    } else {
      quoteIds.push({
        id: quoteId,
        message: "",
      });
    }

    let lastQuoteMessageID = topic.split(" ")[topic.split(" ").length - 1];
    let lastQuoteMessage = await userChannel.messages.fetch(lastQuoteMessageID);
    await lastQuoteMessage.edit({
      content: lastQuoteMessage.content,
      embeds: [
        {
          title: lastQuoteMessage.embeds[0].data.title,
          color: lastQuoteMessage.embeds[0].data.color,
          description: quoteIds.map((q) => q.id).join(" "),
        },
      ],
    });
    return quoteId;
  }
  async createQuoteChannel(quote) {
    if (!(quote instanceof Quote)) return false;
    let quoteId = quote.id;
    let quoteChannel = await this.quoteDB.channels.create({
      name: quoteId,
      type: ChannelType.GuildText,
      topic: "",
      nsfw: false,
      parent: null,
    });

    /* Create Quote Message */
    let quoteMessage = await quoteChannel.send({
      content: quote.content,
    });

    /* Set Topic */
    let quoteTopic = {
      time: Date.now(),
      author: quote.author.id,
      content: quoteMessage.id,
      views: 0,
    };
    await quoteChannel.setTopic(JSON.stringify(quoteTopic));
    return quoteChannel;
  }
  async createUserChannel(user) {
    let userChannel = await this.userDB.channels.create({
      name: this.makeName(user),
      type: ChannelType.GuildText,
      topic: "",
      nsfw: false,
      parent: null,
    });
    let message = await userChannel.send({
      content: `Quotes of <@${user.id}> [https://www.discord.com/users/${user.id}]`,
      embeds: [
        new EmbedBuilder()
          .setTitle("Quote IDs")
          .setColor(this.client.defaults.colors.main),
      ],
    });
    await userChannel.setTopic(message.id);
    return userChannel;
  }

  async deleteQuote(user, quoteId) {
    if (!(user instanceof User)) return false;
    if (!quoteId) return false;
    if (!this.isValidID(quoteId)) return false;

    let userChannel = this.getUserChannel(user);
    if (!userChannel) return false;
    let quoteChannel = this.getQuoteChannel(quoteId);
    if (!quoteChannel) return false;

    let quoteIds = await this.getUserQuotes(user);
    let quote = quoteIds.find((q) => q.id === quoteId);
    if (!quote) return false;
    let quoteMessage = await userChannel.messages.fetch(quote.message);
    if (!quoteMessage) return false;

    quoteIds = quoteIds.filter(
      (q) => q.id !== quoteId && q.message == quote.message,
    );
    if (quoteIds.length) {
      /* Edit the message */
      await quoteMessage.edit({
        content: quoteMessage.content,
        embeds: [
          {
            title: quoteMessage.embeds[0].data.title,
            color: quoteMessage.embeds[0].data.color,
            description: quoteIds.map((q) => q.id).join(" "),
          },
        ],
      });
    } else {
      /* Delete the message */
      let id = quoteMessage.id;
      await quoteMessage.delete();
      /* Remove Id from topic */
      let topic = userChannel.topic;
      let QuoteIdsMessages = topic.split(" ");
      let index = QuoteIdsMessages.indexOf(id);
      if (index > -1) QuoteIdsMessages.splice(index, 1);
      if (QuoteIdsMessages.length) {
        /* Change the topic */
        await userChannel.setTopic(QuoteIdsMessages.join(" "));
      } else {
        /* Delete the channel */
        await userChannel.delete();
      }
    }

    /* Delete the channel */
    await quoteChannel.delete();

    return true;
  }

  getQuoteChannel(quoteId) {
    if (!this.isValidID(quoteId)) return false;
    let quoteChannel = this.quoteDB.channels.cache.find(
      (c) => c.name === quoteId,
    );
    return quoteChannel;
  }
  getUserChannel(user) {
    let name = this.makeName(user);
    return this.userDB.channels.cache.find((c) => c.name === name);
  }
  makeName(user) {
    return `quotes_${user instanceof User ? user.id : user}`;
  }
  isValidID(str) {
    if (typeof str !== "string") return false;
    if (str.length !== 9) return false;
    return /^[a-z0-9]+$/i.test(str);
  }
}

module.exports = QuoteHelper;
