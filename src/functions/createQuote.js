const { NativeFunction, ArgType } = require("@tryforge/forgescript");
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
    quoteContent = quoteContent.join(";");
    let quote = await ctx.client.quote.createQuote(u, quoteContent);
    if (!quote) return this.success("");
    return this.success(quote);
  },
});
