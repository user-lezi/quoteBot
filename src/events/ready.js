module.exports = {
  type: "ready",
  code: `
  $let[dirname;$djsEval[__dirname]]
  $let[inReplit;$startsWith[$get[dirname];/home/runner]]

  $let[channel;$if[$get[inReplit]==true;$getVar[privateLog;channels];$getVar[publicLog;channels]
  ]]

  $sendMessage[$get[channel];
  $title[Bot is online!]
  $timestamp
  $color[$getVar[main;colors]]
  ]
  `,
};
