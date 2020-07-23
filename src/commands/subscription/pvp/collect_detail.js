module.exports = (WDR, Functions, type, Member, Message, object, requirements, sub) => {
  return new Promise(async resolve => {

    // DELCARE VARIABLES
    let timeout = true,
      instruction = "";

    const filter = cMessage => cMessage.author.id == Message.author.id;
    const collector = Message.channel.createMessageCollector(filter, {
      time: 60000
    });

    switch (type) {
      case "Guild":
        let list = "";
        object.forEach((guild, i) => {
          list += (i + 1) + " - " + guild.name + "\n";
        });
        list = list.slice(0, -1);
        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
          .setTitle("Choose a Discord:")
          .setDescription(list)
          .setFooter(requirements);
        break;

      case "Preset":
        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
          .setTitle("Choose a Preset Subscription:")
          .setDescription(object)
          .setFooter(requirements);
        break;

      case "Name":
        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
          .setTitle("What Pokémon would you like to Subscribe to?")
          .setFooter(requirements);
        if (object) {
          instruction.setDescription("Current: `" + object + "`");
        }
        break;

      case "Type":
        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
          .setTitle("What Pokémon Type would you like to Subscribe to?")
          .setFooter(requirements);
        if (object) {
          instruction.setDescription("Current: `" + await WDR.Capitalize(object) + "`");
        }
        break;

      case "Form":
        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
          .setTitle("What Form of " + sub.name + " would you like to Subscribe to?")
          .setDescription("Available Forms:" + "\n　" + sub.forms.join("\n　"))
          .setFooter(requirements);
        if (object) {
          if (object.form == 0) {
            instruction.setDescription("Current: `All Pokémon`" + "\n" +
              "Available Forms:" + "\n　" + sub.forms.join("\n　"));
          } else {
            instruction.setDescription("Current: `" + WDR.Master.Pokemon[object.pokemon_id].forms[object.form].form + "`" + "\n" +
              "Available Forms:" + "\n　" + sub.forms.join("\n　"));
          }
        }
        break;

        // CONFIRMATION EMBED
      case "Confirm-Add":

        let form = "";
        switch (sub.form) {
          case 0:
            form = "All";
            break;
          default:
            form = WDR.Master.Pokemon[sub.id].forms[sub.form];
        }

        let ptype = "";
        switch (sub.pokemon_type) {
          case 0:
            ptype = "All";
          default:
            ptype = await WDR.Capitalize(sub.pokemon_type);
        }

        let league = "";
        switch (sub.league) {
          case 0:
            league = "All";
          default:
            league = await WDR.Capitalize(sub.league);
        }

        let gen = "";
        switch (sub.gen) {
          case 0:
            gen = "All";
            break;
          default:
            gen = sub.gen;
        }

        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
          .setTitle("Does all of this look correct?")
          .setDescription("Name: `" + sub.name + "`\n" +
            "League: `" + league + "`\n" +
            "Type: `" + ptype + "`\n" +
            "Form: `" + form + "`\n" +
            "Min Rank: `" + sub.min_rank + "`\n" +
            //"Min Lvl: `" + sub.min_lvl + "`\n" +
            "Generation: `" + gen + "`\n" +
            "Filter By Areas: `" + sub.geofence + "`")
          .setFooter(requirements);
        break;

      case "Confirm-Remove":
        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
          .setTitle("Are you sure you want to Remove ALL of your subscriptions?")
          .setDescription("If you wanted to remove an `ALL` pokemon filter, you need to specify the number associated with it. \`ALL-1\`, \`ALL-2\`, etc")
          .setFooter(requirements);
        break;

        // REMOVAL EMBED
      case "Remove":
        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
          .setTitle("What PvP Sub do you want to remove?")
          .setFooter(requirements);
        break;

        // MODIFY EMBED
      case "Modify":
        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
          .setTitle("What PvP Sub do you want to modify?")
          .setFooter(requirements);
        break;

        // AREA EMBED
      case "Geofence":
        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
          .setTitle("Do you want to get notifications for " + sub.name + " filtered by your subscribed Areas?")
          .setDescription("If you choose **Yes**, your notifications for this Pokémon will be filtered based on your areas.\n" +
            "If you choose **No**, you will get notifications for this pokemon in ALL areas for the city.")
          .setFooter(requirements);
        break;


        // DEFAULT EMBED
      default:
        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
          .setTitle("What **" + type + "** would like you like to set for **" + sub.name + "** Notifications?")
          .setFooter(requirements);
    }

    Message.channel.send(instruction).then(msg => {

      let input = "";

      // FILTER COLLECT EVENT
      collector.on("collect", async CollectedMsg => {

        if (Message.channel.type != "dm") {
          CollectedMsg.delete();
        }

        switch (true) {

          // CANCEL SUB
          case CollectedMsg.content.toLowerCase() == "stop":
          case CollectedMsg.content.toLowerCase() == "cancel":
            collector.stop("cancel");
            break;

          case type.indexOf("Confirm-Add") >= 0:
          case type.indexOf("Confirm-Remove") >= 0:
            switch (CollectedMsg.content.toLowerCase()) {
              case "save":
              case "yes":
                collector.stop("Yes");
                break;
              case "no":
              case "cancel":
                collector.stop("Cancel");
                break;
              default:
                CollectedMsg.reply("`" + CollectedMsg.content + "` is an Invalid Input. " + requirements).then(m => m.delete({
                  timeout: 5000
                }));
            }
            break;

          case type.indexOf("Geofence") >= 0:
            switch (CollectedMsg.content.toLowerCase()) {
              case (CollectedMsg.content.toLowerCase() == "same"):
              case (CollectedMsg.content.toLowerCase() == "keep"):
              case (CollectedMsg.content.toLowerCase() == "next"):
                collector.stop(object);
                break;
              case "yes":
                collector.stop(Member.db.geofence);
                break;
              case "all":
              case "no":
                collector.stop(Message.Discord.name);
                break;
              case "distance":
                if (!Member.db.coords) {
                  CollectedMsg.reply("**WARNING:** You have not set Coordinates for Distance-based Notifications. You will not receive Notifications for this Sub until you set distance coordinates with the `area` command.").then(m => m.delete({
                    timeout: 11000
                  }));
                  setTimeout(function() {
                    collector.stop(Member.db.coords);
                  }, 11000);
                } else {
                  collector.stop(Member.db.coords);
                }
                break;
              default:
                CollectedMsg.reply("`" + CollectedMsg.content + "` is an Invalid Input. " + requirements).then(m => m.delete({
                  timeout: 5000
                }));
            }
            break;

          case type.indexOf("Guild") >= 0:
          case type.indexOf("Preset") >= 0:
          case type.indexOf("Modify") >= 0:
          case type.indexOf("Remove") >= 0:
            let num = parseInt(CollectedMsg.content);
            switch (true) {
              case (isNaN(CollectedMsg.content)):
                return CollectedMsg.reply("`" + CollectedMsg.content + "` is not a Number. " + requirements).then(m => m.delete({
                  timeout: 5000
                }));
              case (num > 0 && num <= object.length):
                return collector.stop((num - 1));
              default:
                return CollectedMsg.reply("`" + CollectedMsg.content + "` is not a valid # selection. " + requirements).then(m => m.delete({
                  timeout: 5000
                }));
            }
            break;

          case type.indexOf("Name") >= 0:
            switch (true) {
              case (CollectedMsg.content.toLowerCase() == "same"):
              case (CollectedMsg.content.toLowerCase() == "keep"):
              case (CollectedMsg.content.toLowerCase() == "next"):
                let old_data = await WDR.Pokemon_ID_Search(WDR, object.pokemon_id);
                collector.stop(old_data);
                break;
              case (CollectedMsg.content.toLowerCase() == "all"):
                collector.stop(0);
                break;
              default:
                let valid = await WDR.Pokemon_ID_Search(WDR, CollectedMsg.content.split(" ")[0]);
                if (valid) {
                  collector.stop(valid);
                } else {
                  return CollectedMsg.reply("`" + CollectedMsg.content + "` doesn\'t appear to be a valid Pokémon name. Please check the spelling and try again.").then(m => m.delete({
                    timeout: 5000
                  }));
                }
            }
            break;

          case type.indexOf("Type") >= 0:
            switch (true) {
              case (CollectedMsg.content.toLowerCase() == "same"):
              case (CollectedMsg.content.toLowerCase() == "keep"):
              case (CollectedMsg.content.toLowerCase() == "next"):
                let old_data = await WDR.Pokemon_ID_Search(WDR, object.pokemon_id);
                collector.stop(object.pokemon_type);
                break;
              case (CollectedMsg.content.toLowerCase() == "all"):
                collector.stop(0);
                break;
              default:
                let match;
                WDR.Master.Pokemon_Types.forEach(type => {
                  if (type.toLowerCase() == CollectedMsg.content.toLowerCase()) {
                    match = type.toLowerCase();
                    collector.stop(match);
                  }
                });
                if (!match) {
                  return CollectedMsg.reply("`" + CollectedMsg.content + "` doesn\'t appear to be a valid type. Please check the spelling and try again.").then(m => m.delete({
                    timeout: 5000
                  }));
                }
            }
            break;

          case type.indexOf("Form") >= 0:
            let user_form = await WDR.Capitalize(CollectedMsg.content);
            switch (true) {
              case (CollectedMsg.content.toLowerCase() == "same"):
              case (CollectedMsg.content.toLowerCase() == "keep"):
              case (CollectedMsg.content.toLowerCase() == "next"):
                collector.stop(object.form);
                break;
              case (CollectedMsg.content.toLowerCase() == "all"):
                collector.stop(0);
                break;
              case (sub.forms.indexOf(user_form) >= 0):
                collector.stop(sub.forms_ids[sub.forms.indexOf(user_form)]);
                break;
              default:
                return CollectedMsg.reply("`" + CollectedMsg.content + "` doesn\'t appear to be a valid form for `" + object.name + "`. Please check the spelling and try again.").then(m => m.delete({
                  timeout: 5000
                }));
            }
            break;

            // case type.indexOf("CP") >= 0:
            //   if (parseInt(Message.content) > 0) {
            //     collector.stop(Message.content);
            //   } else if (Message.content.toLowerCase() == "all") {
            //     collector.stop("ALL");
            //   } else {
            //     Message.reply("`" + Message.content + "` is an Invalid Input. " + requirements).then(m => m.delete({
            //       timeout: 5000
            //     }));
            //   }
            //   break;

          case type.indexOf("Rank") >= 0:
            if (CollectedMsg.content.toLowerCase() == "all") {
              collector.stop(20);
            } else if (parseInt(CollectedMsg.content) >= 0 && parseInt(CollectedMsg.content) <= 20) {
              collector.stop(CollectedMsg.content);
            } else if (parseInt(CollectedMsg.content) > 20) {
              CollectedMsg.reply("The Lowest Rank you can sub to is 20." + requirements).then(m => m.delete({
                timeout: 5000
              }));
            } else {
              CollectedMsg.reply("`" + CollectedMsg.content + "` is an Invalid Input. " + requirements).then(m => m.delete({
                timeout: 5000
              }));
            }
            break;

          case type.indexOf("Generation") >= 0:
            switch (true) {
              case (CollectedMsg.content.toLowerCase() == "same"):
              case (CollectedMsg.content.toLowerCase() == "keep"):
              case (CollectedMsg.content.toLowerCase() == "next"):
                collector.stop(object.generation);
                break;
              case (CollectedMsg.content.toLowerCase() == "all"):
                collector.stop(0);
                break;
              case (!isNaN(CollectedMsg.content) && CollectedMsg.content > 0):
                collector.stop(parseInt(CollectedMsg.content));
                break;
              default:
                return CollectedMsg.reply("`" + CollectedMsg.content + "` doesn\'t appear to be a valid Generation number.").then(m => m.delete({
                  timeout: 5000
                }));
            }
            break;

          case type.indexOf("Level") >= 0:
            switch (true) {
              case (CollectedMsg.content.toLowerCase() == "same"):
              case (CollectedMsg.content.toLowerCase() == "keep"):
              case (CollectedMsg.content.toLowerCase() == "next"):
                collector.stop(object);
                break;
              case (parseInt(CollectedMsg.content) >= 0 && parseInt(CollectedMsg.content) <= WDR.MaxLevel):
                collector.stop(parseInt(CollectedMsg.content));
                break;
              case (CollectedMsg.content.toLowerCase() == "all"):
                if (type.indexOf("Minimum") >= 0) {
                  collector.stop(0);
                } else {
                  collector.stop(WDR.MaxLevel);
                }
                break;
              default:
                CollectedMsg.reply("`" + CollectedMsg.content + "` is an Invalid Input. " + requirements).then(m => m.delete({
                  timeout: 5000
                }));
            }
            break;

          case type.indexOf("League") >= 0:
            if (CollectedMsg.content.toLowerCase() == "great") {
              collector.stop("great");
            } else if (CollectedMsg.content.toLowerCase() == "ultra") {
              collector.stop("ultra");
            } else {
              CollectedMsg.reply("`" + CollectedMsg.content + "` is an Invalid Input. " + requirements).then(m => m.delete({
                timeout: 5000
              }));
            }
            break;

          default:
            CollectedMsg.reply("`" + CollectedMsg.content + "` is an Invalid Input. Type cancel to quit. this subscription." + requirements).then(m => m.delete({
              timeout: 5000
            }));
        }
      });

      collector.on("end", (collected, reason) => {
        if (reason == null) {
          return;
        }
        if (msg && msg.channel.type != "dm") {
          msg.delete();
        }
        switch (reason) {
          case "cancel":
            return Functions.Cancel(WDR, Functions, Message, Member);
          case "time":
            return Functions.TimedOut(WDR, Functions, Message, Member);
          default:
            return resolve(reason);
        }
      });
    });

    // END
    return;
  });
}