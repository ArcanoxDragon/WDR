const Fuzzy = require("fuzzy");

module.exports = (WDR, Functions, Message, Member, available_gyms, gym_collection) => {

  WDR.wdrDB.query(
    `SELECT
          *
       FROM
          wdr_subscriptions
       WHERE
          user_id = ${Member.id}
            AND
          sub_type = 'raid';`,
    async function(error, subs) {
      if (error) {
        WDR.Console.error(WDR, "[cmd/sub/raid/create.js] Error Fetching Subscriptions to Create Subscription.", [create, error]);
        return Message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete({
          timeout: 10000
        }));
      } else if (subs.length >= 20) {
        let subscription_success = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
          .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
          .setTitle("Maximum Subscriptions Reached!")
          .setDescription("You are at the maximum of 20 subscriptions. Please remove one before adding another.")
          .setFooter("You can type 'view', 'presets', 'remove', or 'edit'.");
        Message.channel.send(subscription_success).then(BotMsg => {
          return Functions.OptionCollect(WDR, Functions, "create", Message, BotMsg, Member);
        });
      } else {

        let create = {},
          got_name = false;

        do {
          create.gym = await Functions.DetailCollect(WDR, Functions, "Gym", Member, Message, null, "Respond with 'All'  or a Gym name. Names are not case-sensitive.", create, available_gyms, gym_collection);
          if (create.gym === 0) {
            create.name = "All";
            create.gym_id = 0;
            got_name = true;

          } else if (create.gym.fuzzy) {

            let results = Fuzzy.filter(create.gym.fuzzy, available_gyms);
            //let matches = results.map(el => el.string);
            let matches = results.map(function(el) {
              return el.string;
            });

            if (matches.length < 1) {
              Message.reply("`" + create.gym + "`, does not closely match any gym in the database.").then(m => m.delete({
                timeout: 8000
              })).catch(console.error);

            } else {
              let user_choice = await Functions.MatchCollect(WDR, Functions, "Matches", Member, Message, matches, "Type the number of the Correct Gym.", create, available_gyms, gym_collection);
              let collection_match = gym_collection.get(matches[user_choice]);
              if (collection_match) {
                create.gym_id = collection_match.id;
                create.name = collection_match.name;
                got_name = true;
              }
            }

          } else if (create.gym.length > 1) {
            let user_choice = await Functions.CollectMatch(WDR, "Multiple", Member, Message, null, "Type the number of the Correct Gym.", create, available_gyms, gym_collection);
            create.gym_id = create.gym[user_choice].id;
            create.gym = create.gym[user_choice].name;
            create.name = create.gym[user_choice].name;
            got_name = true;

          } else {
            create.gym_id = create.gym[0].id;
            create.gym = create.gym[0].name;
            create.name = create.gym[0].name;
            got_name = true;
          }
        }
        while (got_name == false);

        create.pokemon = await Functions.DetailCollect(WDR, Functions, "Name", Member, Message, null, "Respond with 'All', 'Egg' or the Raid Boss's name. Names are not case-sensitive.", create, available_gyms, gym_collection);
        if (create.pokemon.name) {
          create.boss = create.pokemon.name;
          create.name += " " + create.pokemon.name;
          create.pokemon_id = create.pokemon.id;
          create.forms = create.pokemon.forms;
          create.form_ids = create.pokemon.form_ids;
        } else if (create.pokemon < 0) {
          create.name += " Egg";
          create.boss = -1;
          create.pokemon_id = 0;
        } else {
          create.pokemon_id = 0;
          create.boss = 0;
        }

        if (create.pokemon_id === 0) {
          create.min_lvl = await Functions.DetailCollect(WDR, Functions, "Minimum Level", Member, Message, null, "Please respond with a value of 1 through " + WDR.Max_Raid_Level + " or type 'All'. Type 'Cancel' to Stop.", create, available_gyms, gym_collection);

          if (create.min_lvl == WDR.Max_Raid_Level) {
            create.max_lvl = WDR.Max_Raid_Level;
          } else {
            create.max_lvl = await Functions.DetailCollect(WDR, Functions, "Maximum Level", Member, Message, null, "Please respond with a value of 1 through " + WDR.Max_Raid_Level + " or type 'All'. Type 'Cancel' to Stop.", create, available_gyms, gym_collection);
            console.log(create.max_lvl)
          }

        } else {
          create.min_lvl = 1;
          create.max_lvl = WDR.Max_Raid_Level;
        }

        if (create.gym === 0) {
          create.areas = await Functions.DetailCollect(WDR, Functions, "Geofence", Member, Message, null, "Please respond with 'Yes' or 'No'", create, available_gyms, gym_collection);
          if (create.areas == Message.Discord.name) {
            create.geotype = "city";
          } else {
            create.geotype = Member.db.geotype;
          }
        } else {
          create.areas = Message.Discord.name;
          create.geotype = "city";
        }

        create.confirm = await Functions.DetailCollect(WDR, Functions, "Confirm-Add", Member, Message, null, "Type 'Yes' or 'No'. Subscription will be saved.", create, available_gyms, gym_collection);

        let query = `
          INSERT INTO
              wdr_subscriptions (
                  user_id,
                  user_name,
                  guild_id,
                  guild_name,
                  bot,
                  status,
                  geotype,
                  areas,
                  location,
                  sub_type,
                  pokemon_id,
                  gym_id,
                  min_lvl,
                  max_lvl
                )
           VALUES
              (
                ${Member.id},
                '${Member.db.user_name}',
                ${Message.guild.id},
                '${Member.db.guild_name}',
                ${Member.db.bot},
                ${Member.db.pvp_status},
                '${Member.db.geotype}',
                '${create.areas}',
                '${JSON.stringify(Member.db.location)}',
                'raid',
                ${create.pokemon_id},
                '${create.gym_id}',
                ${create.min_lvl},
                '${create.max_lvl}'
              )
          ;`;
        WDR.wdrDB.query(
          query,
          async function(error, result) {
            if (error) {
              if (error.toString().indexOf("Duplicate entry") >= 0) {
                let subscription_success = new WDR.DiscordJS.MessageEmbed().setColor("ff0000")
                  .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
                  .setTitle("Existing Subscription Found!")
                  .setDescription("Nothing has been saved.")
                  .setFooter("You can type 'view', 'presets', 'add', 'add adv', 'remove', or 'edit'.");
                Message.channel.send(subscription_success).then(BotMsg => {
                  return Functions.OptionCollect(WDR, Functions, "create", Message, BotMsg, Member);
                });
              } else {
                WDR.Console.error(WDR, "[cmd/sub/raid/create.js] Error Inserting Subscription.", [query, error]);
                return Message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete({
                  timeout: 10000
                }));
              }
            } else {
              let subscription_success = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
                .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
                .setTitle(create.name + " Raid Subscription Complete!")
                .setDescription("Saved to the Database.")
                .setFooter("You can type 'view', 'presets', 'add', or 'remove'.");
              Message.channel.send(subscription_success).then(msg => {
                return Functions.OptionCollect(WDR, Functions, "create", Message, msg, Member);
              });
            }
          }
        );
      }
    }
  );
}