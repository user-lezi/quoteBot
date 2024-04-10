module.exports = {
  name: 'stats',
  code: `
  $title[Bot Statistics]
  $color[$getVar[color;g]]

  $let[guilds;$guildCount]
  $arrayLoad[guildIds;,;$guildIDs[,]]

  $let[users;0]
  $arrayForEach[guildIds;guildId;$letSum[users;$guildMemberCount[$env[guildId]]]]

  $addField[Guild Count:;**$arrayLength[guildIds]**]
  $addField[User Count:;**$get[users]**]
  

  `
}