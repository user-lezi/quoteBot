const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { ChannelType } = require("discord.js");
module.exports.default = new NativeFunction({
  name: "$deleteQuote",
  version: "1.0.0",
  description: "Deletes the given quote",
  brackets: true,
  unwrap: true,
  args: [
    {
      name: "user ID",
      description: "The user to delete it's quote",
      rest: false,
      required: true,
      type: ArgType.User,
    },
    {
      name: "quote ID",
      description: "The quote to delete",
      rest: false,
      required: true,
      type: ArgType.String,
    },
  ],
  output: ArgType.Number,
  async execute(ctx, [user, quoteId]) {
    let databaseServerId = "1227563351778000896";
    let guild = ctx.client.guilds.cache.get(databaseServerId);
    let channels = guild.channels.cache.filter(
      (c) => c.type === ChannelType.GuildText,
    );

    let channelName = `quotes_${user.id}`;
    let channel = channels.find((c) => c.name === channelName);

    if (!channel) {
      return this.success(1);
    }

    let topic = channel.topic;
    let quoteMessages = topic.split(" ");
    let quoteMessage = null;
    let quoteIds = [];
    for (let qim of quoteMessages) {
      let message = await channel.messages.fetch(qim);
      let found = message.embeds[0].data.description?.split(" ") || [];
      if (found.includes(quoteId)) {
        quoteMessage = message;
        quoteIds = found;
      }
    }
    if (!quoteMessage) {
      return this.success(2);
    }

    let index = quoteIds.indexOf(quoteId);
    /* Remove the quoteId */
    quoteIds.splice(index, 1);
    /* Re-create the message */
    await quoteMessage.edit({
      content: quoteMessage.content,
      embeds: [
        {
          title: quoteMessage.embeds[0].data.title,
          description: quoteIds.join(" ") + "",
          color: quoteMessage.embeds[0].data.color,
        },
      ],
    });

    let quoteGuildId = "1228364773188567062";
    let quoteGuild = ctx.client.guilds.cache.get(quoteGuildId);
    let quoteChannel = quoteGuild.channels.cache.find(
      (c) => c.name === quoteId,
    );
    if (quoteChannel) {
      await quoteChannel.delete();
    }

    return this.success(0);
  },
});
