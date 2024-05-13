module.exports = {
  data: {
    unprefixed: true,
  },
  code: `
  $onlyIf[$messageType==Reply]
  $onlyIf[$or[$messageContent==<!@$clientID>;$messageContent==<@$clientID>]]
  $let[referred;$messageReferenceID]
  $let[content;$trim[$getMessage[$channelID;$get[referred];content]]]
  $if[$get[content]==;
  $title[An Error Occurred!!]
  $description[There is no content to quote.... $bold[$hyperlink[Message Here;$messageLink[$channelID;$get[referred]]]]]
  $color[$getVar[error;colors]]
  $thumbnail[$userAvatar[$getMessage[$channelID;$get[referred];authorID];256]]
  $timestamp
  $reply[$channelID;$get[referred];true]
  ;



$let[author;$getMessage[$channelID;$get[referred];authorID]]
$makeCanvas[quote.png;$get[author];$get[content]]



  
  ]
`,
};
