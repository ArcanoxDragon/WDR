module.exports = (WDR, Functions, type, Member, Message, object, requirements, sub) => {
  return new Promise(async resolve => {
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
          instruction.setDescription("Current: `" + WDR.Capitalize(object) + "`");
        }
        break;

      case "Form":
        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
          .setTitle("What Form of " + sub.name + " would you like to Subscribe to?")
          .setDescription(sub.forms)
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

      case "Confirm-Add":

        let gender = "";
        if (sub.gender == 1) {
          gender = "Male";
        } else if (sub.gender == 2) {
          gender = "Female";
        } else {
          gender = "All";
        }

        let size = "";
        if (sub.size == 0) {
          size = "All";
        } else {
          size = await WDR.Capitalize(size);
        }

        let ptype = "";
        if (sub.pokemon_type == 0) {
          ptype = "All";
        } else {
          ptype = await WDR.Capitalize(sub.pokemon_type);
        }

        let form = "";
        if (sub.form == 0) {
          form = "All";
        } else {
          form = WDR.Master.Pokemon[sub.pokemon_id].forms[sub.form].form;
        }

        let gen = "";
        if (sub.form == 0) {
          gen = "All";
        } else {
          gen = sub.gen;
        }

        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
          .setTitle("Does all of this look correct?")
          .setDescription("Name: `" + sub.name + "`\n" +
            "Form: `" + form + "`\n" +
            "Type: `" + ptype + "`\n" +
            "Min IV: `" + sub.min_iv + "`\n" +
            "Max IV: `" + sub.max_iv + "`\n" +
            "Min Lvl: `" + sub.min_lvl + "`\n" +
            "Max Lvl: `" + sub.max_lvl + "`\n" +
            "Gender: `" + gender + "`\n" +
            "Size: `" + size + "`\n" +
            "Generation: `" + gen + "`\n" +
            "Areas: `" + sub.areas + "`")
          .setFooter(requirements);
        break;

      case "Confirm-Remove":
        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
          .setTitle("Are you sure you want to Remove ALL of your subscriptions?")
          .setDescription("If you wanted to remove an `ALL` pokemon filter, you need to specify the number associated with it. \`ALL-1\`, \`ALL-2\`, etc")
          .setFooter(requirements);
        break;

      case "Remove":
        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
          .setTitle("Which Subscription do you want to remove?")
          .setDescription(sub)
          .setFooter(requirements);
        break;

      case "Modify":
        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
          .setTitle("Which Subscription do you want to Modify?")
          .setDescription(sub)
          .setFooter(requirements);
        break;

      case "Geofence":
        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
          .setTitle("Do you want to get notifications for " + sub.name + " filtered by your set Areas/Location?")
          .setDescription("**Yes** - Your notifications for this Pokémon will be filtered based on your set areas/location.\n" +
            "**No** - You will get notifications for this pokemon in the entire city scan area.")
          .setFooter(requirements);
        break;

      default:
        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
          .setTitle("What **" + type + "** would like you like to set for **" + sub.name + "** Notifications?")
          .setFooter(requirements);
        if (object) {
          instruction.setDescription("Current: `" + object + "`");
        }
    }
    return Message.channel.send(instruction).then(msg => {

      let input = "";

      collector.on("collect", async CollectedMsg => {

        try {
          CollectedMsg.delete();
        } catch (e) {

        }

        switch (true) {

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
                return Functions.Cancel(WDR, Functions, Message, Member);
                collector.stop(null);
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
                if (Member.db.geotype == "location") {
                  let locations = Object.keys(Member.db.locations).map(i => Member.db.locations[i]);
                  let coords = Member.db.location.split(";")[0];
                  let distance = Member.db.location.split(";")[1];
                  locations.forEach((location, index) => {
                    if (location.coords == coords && location.radius == distance) {
                      collector.stop(location.name);
                    }
                  });
                } else if (Member.db.geotype == "areas") {
                  collector.stop(Member.db.areas);
                }
                break;
              case "all":
              case "no":
                collector.stop(Message.Discord.name);
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
                collector.stop(object);
                break;
              case (CollectedMsg.content.toLowerCase() == "all"):
                collector.stop(0);
                break;
              default:
                let valid = await WDR.Pokemon_ID_Search(WDR, CollectedMsg.content.split(" ")[0]);
                if (valid) {
                  return collector.stop(valid);
                } else {
                  return CollectedMsg.reply("`" + CollectedMsg.content + "` doesn't appear to be a valid Pokémon name. Please check the spelling and try again.").then(m => m.delete({
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
                collector.stop(object);
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
                  return CollectedMsg.reply("`" + CollectedMsg.content + "` doesn't appear to be a valid type. Please check the spelling and try again.").then(m => m.delete({
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
                collector.stop(object);
                break;
              case (CollectedMsg.content.toLowerCase() == "all"):
                collector.stop(0);
                break;
              case (sub.forms.indexOf(user_form) >= 0):
                collector.stop(sub.form_ids[sub.forms.indexOf(user_form)]);
                break;
              default:
                return CollectedMsg.reply("`" + CollectedMsg.content + "` doesn't appear to be a valid form for `" + object.name + "`. Please check the spelling and try again.").then(m => m.delete({
                  timeout: 5000
                }));
            }
            break;

          case type.indexOf("Generation") >= 0:
            switch (true) {
              case (CollectedMsg.content.toLowerCase() == "same"):
              case (CollectedMsg.content.toLowerCase() == "keep"):
              case (CollectedMsg.content.toLowerCase() == "next"):
                collector.stop(object);
                break;
              case (CollectedMsg.content.toLowerCase() == "all"):
                collector.stop(0);
                break;
              case (!isNaN(CollectedMsg.content) && CollectedMsg.content > 0):
                collector.stop(parseInt(CollectedMsg.content));
                break;
              default:
                return CollectedMsg.reply("`" + CollectedMsg.content + "` doesn't appear to be a valid Generation number.").then(m => m.delete({
                  timeout: 5000
                }));
            }
            break;

          case type.indexOf("IV") >= 0:
            CollectedMsg.content = CollectedMsg.content.replace("%", "");
            switch (true) {
              case (CollectedMsg.content.toLowerCase() == "same"):
              case (CollectedMsg.content.toLowerCase() == "keep"):
              case (CollectedMsg.content.toLowerCase() == "next"):
                collector.stop(object);
                break;
              case (parseInt(CollectedMsg.content) >= 0 && parseInt(CollectedMsg.content) <= 100):
                collector.stop(parseInt(CollectedMsg.content));
                break;
              case (CollectedMsg.content.toLowerCase() == "all"):
                if (type.indexOf("Minimum") >= 0) {
                  collector.stop(0);
                } else {
                  collector.stop(100);
                }
                break;
              default:
                CollectedMsg.reply("`" + CollectedMsg.content + "` is an Invalid Input. " + requirements).then(m => m.delete({
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

          case type.indexOf("Gender") >= 0:
            switch (true) {
              case (CollectedMsg.content.toLowerCase() == "same"):
              case (CollectedMsg.content.toLowerCase() == "keep"):
              case (CollectedMsg.content.toLowerCase() == "next"):
                collector.stop(object);
                break;
              case (CollectedMsg.content.toLowerCase() == "male"):
                collector.stop(1);
                break;
              case (CollectedMsg.content.toLowerCase() == "female"):
                collector.stop(2);
                break;
              case (CollectedMsg.content.toLowerCase() == "all"):
                collector.stop(0);
                break;
              default:
                CollectedMsg.reply("`" + CollectedMsg.content + "` is an Invalid Input. " + requirements).then(m => m.delete({
                  timeout: 5000
                }));
            }
            break;

          case type.indexOf("Size") >= 0:
            switch (true) {
              case (CollectedMsg.content.toLowerCase() == "same"):
              case (CollectedMsg.content.toLowerCase() == "keep"):
              case (CollectedMsg.content.toLowerCase() == "next"):
                collector.stop(object);
                break;
              case (CollectedMsg.content.toLowerCase() == "big"):
                collector.stop("big");
                break;
              case (CollectedMsg.content.toLowerCase() == "large"):
                collector.stop("large");
                break;
              case (CollectedMsg.content.toLowerCase() == "normal"):
                collector.stop("normal");
                break;
              case (CollectedMsg.content.toLowerCase() == "small"):
                collector.stop("small");
                break;
              case (CollectedMsg.content.toLowerCase() == "tiny"):
                collector.stop("tiny");
                break;
              case (CollectedMsg.content.toLowerCase() == "all"):
                collector.stop(0);
                break;
              default:
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
          try {
            msg.delete();
          } catch (e) {

          }
        }
        switch (reason) {
          case "cancel":
            return Functions.Cancel(WDR, Functions, Message, Member, "Pokemon");
          case "time":
            return Functions.TimedOut(WDR, Functions, Message, Member, "Pokemon");
          default:
            return resolve(reason);
        }
      });
    });

    // END
    return;
  });
}