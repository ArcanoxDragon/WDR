module.exports = (WDR, Functions, Message, Member) => {
  WDR.wdrDB.query(
    `SELECT
        *
     FROM
        wdr_subscriptions
     WHERE
        user_id = ${Member.id}
        AND guild_id = ${Message.guild.id}
        AND sub_type = 'pokemon'`,
    async function(error, subscriptions) {
      if (!subscriptions || subscriptions.length < 1) {
        let no_subscriptions = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
          .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
          .setTitle("You do not have any Pokémon Subscriptions!")
          .setFooter("You can type \'view\', \'presets\', \'add\', \'add adv\', \'remove\', or \'edit\'.");
        Message.channel.send(no_subscriptions).catch(console.error).then(BotMsg => {
          return Functions.OptionCollect(WDR, Functions, "view", Message, BotMsg, Member);
        });
      } else {

        let sub_list = "";
        for (let s = 0, slen = subscriptions.length; s < slen; s++) {
          let choice = s + 1;
          let sub_data = subscriptions[s];
          sub_data.pokemon_name = WDR.Master.Pokemon[sub_data.pokemon_id] ? WDR.Master.Pokemon[sub_data.pokemon_id].name : "All Pokémon";
          sub_list += "**" + choice + " - " + sub_data.pokemon_name + "**\n";
          let data = "";
          if (sub_data.form > 0) {
            data += "　Form: `" + WDR.Master.Pokemon[sub_data.pokemon_id].forms[sub_data.form].form + "`\n";
          }
          if (sub_data.min_iv != 0) {
            data += "　Min IV: `" + sub_data.min_iv + "`\n";
          }
          if (sub_data.max_iv != 100) {
            data += "　Max IV: `" + sub_data.max_iv + "`\n";
          }
          if (sub_data.min_lvl != 0 && sub_data.min_lvl != 1) {
            data += "　Min Lvl: `" + sub_data.min_lvl + "`\n";
          }
          if (sub_data.max_lvl != WDR.MaxLevel) {
            data += "　Max Lvl: `" + sub_data.max_lvl + "`\n";
          }
          if (sub_data.gender != '0') {
            let gender = await WDR.Get_Gender(sub_data.gender);
            data += "　Gender: `" + gender + "`\n";
          }
          if (sub_data.size != '0') {
            data += "　Size: `" + sub_data.size + "`\n";
          }
          if (sub_data.generation != 0) {
            data += "　Gen: `" + sub_data.generation + "`\n";
          }
          if (!data) {
            data = "　`All" + "`\n";;
          }
          sub_list += data + "\n";
        }
        sub_list = sub_list.slice(0, -1);

        let o_status = Member.db.status ? "Enabled" : "Disabled";
        let p_status = Member.db.pokemon_status ? "Enabled" : "Disabled";
        let pokemonSubs = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
          .setTitle("Your Pokémon Subscriptions")
          .setDescription("Overall Status: `" + o_status + "`\n" +
            "Pokemon Status: `" + p_status + "`\n\n" + sub_list)
          .setFooter("You can type \'view\', \'presets\', \'add\', \'add adv\', \'remove\', or \'edit\'.");
        Message.channel.send(pokemonSubs).catch(console.error).then(BotMsg => {
          return Functions.OptionCollect(WDR, Functions, "view", Message, BotMsg, Member);
        });
      }
    }
  );
}