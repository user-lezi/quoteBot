const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { ChannelType, EmbedBuilder } = require("discord.js");
const { Quote } = require("../quote");
module.exports.default = new NativeFunction({
  name: "$createQuote",
  version: "1.0.0",
  description: "Creates a new quote",
  brackets: true,
  unwrap: true,
  args: [
    {
      name: "user ID",
      description: "Quote author ID",
      rest: false,
      required: true,
      type: ArgType.User,
    },
    {
      name: "quote",
      description: "Quote content",
      rest: true,
      required: true,
      type: ArgType.String,
    },
  ],
  output: ArgType.String,
  async execute(ctx, [u, ...quoteContent]) {
    let databaseServerId = "1227563351778000896";
    let guild = ctx.client.guilds.cache.get(databaseServerId);

    let channelName = `quotes_${u.id}`;
    let channel = guild.channels.cache.find((c) => c.name === channelName);
    if (!channel) {
      /* Create one */
      let options = {
        name: channelName,
        type: ChannelType.GuildText,
        topic: "",
        nsfw: false,
        parent: null,
      };
      channel = await guild.channels.create(options);

      let msg = await channel.send({
        content: `Quotes of <@${u.id}> [https://www.discord.com/users/${u.id}]`,
        embeds: [new EmbedBuilder().setTitle("Quote IDs")],
      });
      await channel.setTopic(msg.id);
    }
    let topic = channel.topic;
    let quoteIdsMsg = topic.split(" ");
    let quoteIds = [];
    for (let qim of quoteIdsMsg) {
      let message = await channel.messages.fetch(qim);
      quoteIds.push(...(message.embeds[0].data.description?.split(" ") || []));
    }
    let quote = new Quote(u, quoteContent.join(";"));
    let quoteId = quote.id;

    quoteIds.push(quoteId);

    if (quoteIds.length > 25) {
      let msg = await channel.send({
        content: `Quotes of <@${u.id}> [https://www.discord.com/users/${u.id}]`,
        embeds: [new EmbedBuilder().setTitle("Quote IDs")],
      });
      topic += " " + msg.id;
      await channel.setTopic(topic);
    }

    let lastQuoteMsg = topic.split(" ")[topic.split(" ").length - 1];
    let lastQuote = await channel.messages.fetch(lastQuoteMsg);
    await lastQuote.edit({
      content: `Quotes of <@${u.id}> [https://www.discord.com/users/${u.id}]`,
      embeds: [
        new EmbedBuilder()
          .setTitle("Quote IDs")
          .setDescription(quoteIds.join(" ")),
      ],
    });

    /* Create Quote Channel */
    let quoteGuildId = "1228364773188567062";
    let quoteGuild = ctx.client.guilds.cache.get(quoteGuildId);
    let quoteChannel = await quoteGuild.channels.create({
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
      author: u.id,
      content: quoteMessage.id,
    };
    await quoteChannel.setTopic(JSON.stringify(quoteTopic));

    return this.success(quoteId);
  },
});
