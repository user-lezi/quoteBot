const { NativeFunction, ArgType } = require("@tryforge/forgescript");
module.exports.default = new NativeFunction({
  name: "$addViewTo",
  version: "1.0.0",
  description: "Adds view the given quote",
  brackets: true,
  unwrap: true,
  args: [
    {
      name: "quote ID",
      description: "The quote to add view",
      rest: false,
      required: true,
      type: ArgType.String,
    },
  ],
  output: ArgType.Boolean,
  async execute(ctx, [quoteId]) {
    return this.success((await ctx.client.quote.addView(quoteId)).views);
  },
});
