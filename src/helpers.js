const { readdirSync, statSync } = require("fs");
const { join } = require("path");

function readdir(dir) {
  let files = [];
  for (const file of readdirSync(dir)) {
    const path = join(dir, file);
    const stats = statSync(path);
    if (stats.isDirectory()) {
      files = [...files, ...readdir(path)];
    } else {
      files.push(path);
    }
  }
  return files;
};

function drawConsoleLine(char = '-') {
  console.log(char.repeat(process.stdout.columns));
}


class CustomHelpers {
  constructor(client) {
    client.helpers = this;
    this.client = client;
  }

  loadCommands() {
    const commandsPath = join(__dirname, 'commands');
    const commands = readdir(commandsPath);
    console.log('Loading commands... [' + commands.length + ']')
    drawConsoleLine()
    for (const command of commands) {
      const cmd = require(command);
      cmd.type = 'messageCreate'
      this.client.commands.add(cmd);
      console.log(`> Loaded "${cmd.name}" [${command}]`)
      drawConsoleLine();
    }
  }
}

module.exports = CustomHelpers;