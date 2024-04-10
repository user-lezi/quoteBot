const express = require('express');
const app = express();
const { ForgeClient } = require("@tryforge/forgescript");
const { join } = require("path");
const CustomHelpers = require('./helpers');

const client = new ForgeClient({
    intents: [
        "GuildMessages",
        "Guilds",
        "MessageContent"
    ],
    events: [
        "messageCreate",
        "ready"
    ],
    prefixes: [
        "qi"
    ]
});
const helpers = new CustomHelpers(client);

helpers.loadCommands();



client.commands.add({
  type: 'ready',
  code: `
  $log[Ready on $userTag[$clientID]]
  `
})





client.login(process.env.TOKEN).catch(function () {})
app.listen(3000, () => {
  console.log('server started');
});