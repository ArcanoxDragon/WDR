module.exports = (WDR, Functions, Message, Member, reason) => {
  WDR.wdrDB.query(
    `SELECT
        *
     FROM
        wdr_users
     WHERE
        user_id = '${Member.id}'
          AND
        sub_type = 'pvp'`,
    async function(error, user) {
      if (Member.db.pvp_status == 1 && reason == "resume") {
        let already_active = new WDR.DiscordJS.MessageEmbed().setColor("ff0000")
          .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
          .setTitle("Your PvP subscriptions are already **Active**!")
          .setFooter("You can type \'view\', \'presets\', \'add\', \'remove\', or \'edit\'.");
        Message.channel.send(already_active).catch(console.error).then(msg => {
          return Functions.OptionCollect(WDR, Functions, "view", Message, nMessage, Member);
        });
      } else if (Member.db.pvp_status == 0 && reason == "pause") {
        let already_paused = new WDR.DiscordJS.MessageEmbed().setColor("ff0000")
          .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
          .setTitle("Your PvP subscriptions are already **Paused**!")
          .setFooter("You can type \'view\', \'presets\', \'add\', \'remove\', or \'edit\'.");
        Message.channel.send(already_paused).catch(console.error).then(msg => {
          return Functions.OptionCollect(WDR, Functions, "view", Message, nMessage, Member);
        });
      } else {
        if (reason == "pause") {
          change = 0;
        } else if (reason == "resume") {
          change = 1;
        }
        WDR.wdrDB.query(
          `UPDATE
              wdr_users
           SET
              pvp_status = ${change}
           WHERE
              user_id = '${Member.id}'
                AND 
              guild_id = '${Message.guild.id}'`,
          async function(error, user, fields) {
            if (error) {
              WDR.Console.error(WDR, "[cmd/pvp/remove.js] Error Inserting Subscription.", [preset, error]);
              return Message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete({
                timeout: 10000
              }));
            } else {
              WDR.wdrDB.query(
                `UPDATE
                    wdr_subscriptions
                 SET
                    status = ${change}
                 WHERE
                    user_id = '${Member.id}'
                      AND 
                    sub_type = 'pvp'`,
                async function(error, user, fields) {
                  if (error) {
                    WDR.Console.error(WDR, "[cmd/pvp/remove.js] Error Inserting Subscription.", [preset, error]);
                    return Message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete({
                      timeout: 10000
                    }));
                  } else {
                    let subscription_success = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
                      .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
                      .setTitle("Your Pokémon Subscriptions have been set to `" + change + "`!")
                      .setFooter("Saved to the subscription Database.");
                    return Message.channel.send(subscription_success).then(m => m.delete({
                      timeout: 5000
                    }));
                  }
                }
              );
            }
          }
        );
      }
    }
  );
}