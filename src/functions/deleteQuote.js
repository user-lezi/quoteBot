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
  output: ArgType.Boolean,
  async execute(ctx, [user, quoteId]) {
    return this.success(
      await ctx.client.quote.deleteQuote(user, quoteId)
    )
  }
});
