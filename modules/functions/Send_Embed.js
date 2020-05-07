// CHOOSE NEXT BOT AND SEND EMBED
var errors = 0;

module.exports = (MAIN, type, raid_level, server, content, embed, channel_id) => {

  if(!MAIN.BOTS){ return console.error('BOTS aren\'t active or problem finding any BOTS.'); }

  if(!MAIN.Next_Bot){ MAIN.Next_Bot = 0; }
  if(MAIN.Next_Bot == MAIN.BOTS.length-1 && MAIN.BOTS[0]){ MAIN.Next_Bot = 0; } else{ MAIN.Next_Bot++; }
  let channel = MAIN.BOTS[MAIN.Next_Bot].channels.cache.get(channel_id);
  if(!channel) {
    errors++; console.error('Problem finding channel: '+channel_id+' using Bot: '+MAIN.Next_Bot);
    if(errors >= 5){ MAIN.restart('Channel Send Errors',1); }
  }
	return channel.send(content, embed).catch( error => {
    return console.error('[Send_Embed] ['+MAIN.Bot_Time(null,'stamp')+'] ['+channel_id+']', error);
  });
  return;
}
