const { readdirSync, statSync } = require("fs");
const { join } = require("path");
const { FunctionManager } = require('@tryforge/forgescript');

const GlobalVariables = require("./variables.json");

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
}

function drawConsoleLine(char = "-") {
  console.log(char.repeat(process.stdout.columns));
}

class CustomHelpers {
  constructor(client) {
    client.helpers = this;
    this.client = client;
  }

  loadCommands() {
    const commandsPath = join(__dirname, "commands");
    const commands = readdir(commandsPath);
    console.log("Loading commands... [" + commands.length + "]");
    drawConsoleLine();
    for (const command of commands) {
      const cmd = require(command);
      cmd.type = "messageCreate";
      this.client.commands.add(cmd);
      console.log(`> Loaded "${cmd.name}" [${command}]`);
    }
    drawConsoleLine();
  }

  loadGlobalVariables() {
    let variableLength = Object.keys(GlobalVariables).length;
    console.log("Loading Variables... [" + variableLength + "]");
    let code = "";
    for (let [id, valuesJson] of Object.entries(GlobalVariables)) {
      for(let [key, value] of Object.entries(valuesJson)) {
        code += `$setVar[${key};${id};${value}]\n`;
      }
    }
    this.client.commands.add({
      type: "ready",
      code,
    });
    drawConsoleLine();
  }

  loadFunctions() {
    const functionsPath = join(__dirname, "functions");
    const functions = readdirSync(functionsPath);
    console.log("Loading Functions... [" + functions.length + "]");
    drawConsoleLine();
    for (const functionFile of functions) {
      const func = require('./' + join('functions', functionFile)). default;
      console.log(`> Loaded "${func.name}" [${functionFile}]`);
    }
    //this.client.functions.load(join(__dirname, 'functions'))
      FunctionManager.load('CustomHelper', join(__dirname, 'functions'))
    drawConsoleLine();
  }
}

module.exports = CustomHelpers;
