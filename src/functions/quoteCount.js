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
  async execute(ctx, [user]) {
    if (user) {
      return this.success(await ctx.client.quote.quoteCount(user));
    } else {
      return this.success(await ctx.client.quote.allQuoteCount());
    }
  },
});
