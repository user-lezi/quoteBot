const express = require("express");
const app = express();
const { ForgeClient } = require("@tryforge/forgescript");
const { join } = require("path");
const CustomHelpers = require("./helpers");

/* Extensions */
const { ForgeCanvas } = require("@tryforge/forge.canvas");
const { ForgeDB } = require("@tryforge/forge.db");

const client = new ForgeClient({
  intents: ["GuildMessages", "Guilds", "MessageContent"],
  events: ["messageCreate", "ready"],
  prefixes: ["qi"],
  extensions: [new ForgeCanvas(), new ForgeDB(join(__dirname, "./d.db"))],
});
console.clear();
const helpers = new CustomHelpers(client);

helpers.loadGlobalVariables();
helpers.loadHelpers();
helpers.loadFunctions();
helpers.loadEvents();
helpers.loadCommands();

client.login(process.env.TOKEN).catch(function () {});
app.listen(3000, () => {
  console.log("server started");
});
