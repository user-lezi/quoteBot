const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { ChannelType } = require("discord.js");
module.exports.default = new NativeFunction({
  name: "$quoteCount",
  version: "1.0.0",
  description: "Returns the user's or total quote count",
  brackets: false,
  unwrap: true,
  args: [
    {
      name: "user ID",
      description: "The user to get its quotes",
      rest: false,
      required: true,
      type: ArgType.User,
    },
  ],
  output: ArgType.Number,
  async execute(ctx, [u]) {
    let databaseServerId = "1227563351778000896";
    let guild = ctx.client.guilds.cache.get(databaseServerId);
    let channels = guild.channels.cache.filter(
      (c) => c.type === ChannelType.GuildText,
    );
    if (u) {
      let channelName = `quotes_${u.id}`;
      let channel = channels.find((c) => c.name === channelName);
      if (channel) {
        let topic = channel.topic;
        let quoteMessages = topic.split(" ");
        let quoteIds = [];
        for (let qim of quoteMessages) {
          let message = await channel.messages.fetch(qim);
          quoteIds.push(
            ...(message.embeds[0].data.description?.split(" ") || []),
          );
        }
        let quoteCount = quoteIds.split(" ").length;
        return this.success(quoteCount);
      } else {
        return this.success(0);
      }
    } else {
      let quoteCount = 0;
      for (let channel of channels) {
        if (!channel.name.startWith("quotes_")) continue;
        let topic = channel.topic;
        let quoteMessages = topic.split(" ");
        let quoteIds = [];
        for (let qim of quoteMessages) {
          let message = await channel.messages.fetch(qim);
          quoteIds.push(
            ...(message.embeds[0].data.description?.split(" ") || []),
          );
        }
        quoteCount += quoteIds.split(" ").length;
      }
      return this.success(quoteCount);
    }
  },
});
