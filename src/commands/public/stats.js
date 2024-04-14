module.exports = {
  name: 'stats',
  code: `
  $title[Bot Statistics]
  $color[$getVar[main;colors]]

  $let[guilds;$guildCount]
  $arrayLoad[guildIds;,;$guildIDs[,]]

  $let[users;0]
  $arrayForEach[guildIds;guildId;$letSum[users;$guildMemberCount[$env[guildId]]]]

  $addField[General Information;
Total Quotes Saved: **$quoteCount**
]

  $addField[Bot Information;
Guild Count: **$arrayLength[guildIds]**
Total Members Count: **$get[users]** *(avg $floor[$math[$get[users]/$arrayLength[guildIds]]] users in each guild)*
Uptime: **$parseMS[$uptime]**
]
  

  `
}