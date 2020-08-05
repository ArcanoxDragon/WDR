module.exports = (WDR, Functions, Message, Member) => {
  WDR.wdrDB.query(
    `SELECT
        *
     FROM
        wdr_subscriptions
     WHERE
        user_id = ${Member.id}
          AND 
        sub_type = 'pokemon';`,
    async function(error, subscriptions, fields) {
      if (!subscriptions || !subscriptions[0]) {
        let no_subscriptions = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
          .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
          .setTitle("You do not have any Pokémon Subscriptions!")
          .setFooter("You can type \'view\', \'presets\', \'add\', \'add adv\', \'remove\', or \'edit\'.");
        Message.channel.send(no_subscriptions).catch(console.error).then(BotMsg => {
          return Functions.OptionCollect(WDR, Functions, "view", Message, BotMsg, Member);
        });
      }

      let sub_list = "";
      for (let s = 0, slen = subscriptions.length; s < slen; s++) {
        let choice = s + 1;
        let sub_data = subscriptions[s];
        sub_data.id = sub_data.id ? sub_data.id : sub_data.pokemon_id;
        sub_data.pokemon_name = WDR.Master.Pokemon[sub_data.id] ? WDR.Master.Pokemon[sub_data.id].name : "All Pokémon";
        sub_list += "**" + choice + " - " + sub_data.pokemon_name + "**\n";
        let data = "";
        if (sub_data.form > 0) {
          data += "　Form: `" + WDR.Master.Pokemon[sub_data.id].forms[sub_data.form].form + "`\n";
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
        if (sub_data.gender != 0) {
          let gender = await WDR.Get_Gender(sub_data.gender);
          data += "　Gender: `" + gender + "`\n";
        }
        if (sub_data.size != 0) {
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

      let number = await Functions.DetailCollect(WDR, Functions, "Modify", Member, Message, subscriptions, "Type the corressponding # of the subscription you would like to remove -OR- type \'all\'", sub_list);

      let old = subscriptions[number];

      let modified = subscriptions[number];

      old.name = WDR.Master.Pokemon[old.pokemon_id] ? WDR.Master.Pokemon[old.pokemon_id].name : "All Pokémon";
      if (WDR.Master.Pokemon[old.pokemon_id]) {
        old.form_name = WDR.Master.Pokemon[old.pokemon_id].forms[old.form] ? WDR.Master.Pokemon[old.pokemon_id].forms[old.form].form : "All";
      } else {
        old.form_name = "All";
      }

      modified.pokemon = await Functions.DetailCollect(WDR, Functions, "Name", Member, Message, old.name, "Respond with \'Next\', \'All\', or the Pokémon Name and Form if it has one. Names are not case-sensitive.", modified);
      modified.name = modified.pokemon.name ? modified.pokemon.name : modified.pokemon;
      modified.id = modified.pokemon.id ? modified.pokemon.id : modified.pokemon;

      old.form_name = WDR.Master.Pokemon[old.pokemon_id] ? WDR.Master.Pokemon[old.pokemon_id].forms[old.form] : "All";

      if (modified.id > 0) {
        modified.form = await Functions.DetailCollect(WDR, Functions, "Form", Member, Message, old.form_name, "Please respond with \'Next\', a Form Name of the specified Pokemon, -OR- type \'All\'. Type \'Cancel\' to Stop.", modified);
      } else {
        modified.type = await Functions.DetailCollect(WDR, Functions, "Type", Member, Message, old.pokemon_type, "Please respond with the Pokemon Type -OR- type \'All\'. Type \'Cancel\' to Stop.", modified);
      }
      if (modifed.form = old.form_name) {
        modified.form = old.form;
      }

      if (modified.pokemon == 0) {
        modified.gen = await Functions.DetailCollect(WDR, Functions, "Generation", Member, Message, old.gen, "Please respond with \'Next\', a Generation Number, -OR- type \'All\'. Type \'Cancel\' to Stop.", modified);
      } else {
        modified.gen = old.generation;
      }

      modified.min_iv = await Functions.DetailCollect(WDR, Functions, "Minimum IV", Member, Message, old.min_iv, "Please respond with \'Next\', an Number between 1 and 100, -OR- type \'All\'. Type \'Cancel\' to Stop.", modified);

      if (modified.min_iv == 100) {
        modified.max_iv = 100;
      } else {
        modified.max_iv = await Functions.DetailCollect(WDR, Functions, "Maximum IV", Member, Message, old.max_iv, "Please respond with \'Next\', an Number between 1 and 100, -OR- type \'All\'. Type \'Cancel\' to Stop.", modified);
      }

      modified.min_lvl = await Functions.DetailCollect(WDR, Functions, "Minimum Level", Member, Message, old.min_lvl, "Please respond with \'Next\', a Number between 0 and " + WDR.MaxLevel + ", or type \'All\'. Type \'Cancel\' to Stop.", modified);

      if (modified.min_lvl == WDR.MaxLevel) {
        modified.max_lvl = WDR.MaxLevel;
      } else {
        modified.max_lvl = await Functions.DetailCollect(WDR, Functions, "Maximum Level", Member, Message, old.max_lvl, "Please respond with \'Next\', a Number between 0 and " + WDR.MaxLevel + ", or type \'All\'. Type \'Cancel\' to Stop.", modified);
      }

      if (sub.pokemon > 0) {
        modified.gender = await Functions.DetailCollect(WDR, Functions, "Gender", Member, Message, old.gender, "Please respond with \'Next\', \'Male\', \'Female\', or type \'All\'.", modified);
        modified.size = await Functions.DetailCollect(WDR, Functions, "Size", Member, Message, old.size, "Please respond with \'Next\', \'Big\', \'Large\', \'Normal\', \'Small\', \'Tiny\' or \'All\'.", modified);
        modified.size = modified.size.toLowerCase();
      } else {
        modified.size = 0;
      }

      modified.areas = await Functions.DetailCollect(WDR, Functions, "Geofence", Member, Message, old.areas, "Please respond with \'Yes\', \'No\', or \'Distance\'", modified);
      if (modified.areas == Message.Discord.name) {
        modified.geotype = "city";
      } else {
        modified.geotype = Member.db.geotype;
      }

      modified.confirm = await Functions.DetailCollect(WDR, Functions, "Confirm-Add", Member, Message, undefined, "Type \'Yes\' or \'No\'. Subscription will be saved.", modified);

      let modify = `
        UPDATE
            wdr_subscriptions
        SET
            areas = '${modified.areas}',
            geotype = '${modified.geotype}',
            pokemon_id = ${modified.id},
            form = ${modified.form},
            min_lvl = ${modified.min_lvl},
            max_lvl = ${modified.max_lvl},
            min_iv = ${modified.min_iv},
            max_iv = ${modified.max_iv},
            size = '${modified.size}',
            gender = ${modified.gender},
            generation = ${modified.gen}
        WHERE
            user_id = ${Message.author.id}
            AND guild_id = ${Message.guild.id}
            AND sub_type = 'pokemon'
            AND pokemon_id = ${old.pokemon_id}
            AND form = ${old.form}
            AND min_lvl = ${old.min_lvl}
            AND max_lvl = ${old.max_lvl}
            AND min_iv = ${old.min_iv}
            AND max_iv = ${old.max_iv}
            AND size = '${old.size}'
            AND gender = ${old.gender}
            AND generation = ${old.generation};
      `;
      WDR.wdrDB.query(
        modify,
        async function(error, existing) {
          if (error) {
            return Message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete({
              timeout: 10000
            }));
          } else {
            let modification_success = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
              .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
              .setTitle(modified.name + " Subscription Modified!")
              .setDescription("Saved to the subscription Database.")
              .setFooter("You can type \'view\', \'presets\', \'add\', \'add adv\', \'remove\', or \'edit\'.");
            return Message.channel.send(modification_success).then(BotMsg => {
              return Functions.OptionCollect(WDR, Functions, "modify", Message, BotMsg, Member);
            });
          }
        }
      );
    }
  );
}