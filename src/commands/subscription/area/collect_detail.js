module.exports = async (WDR, Functions, type, Member, Message, object, requirements, sub, AreaArray) => {
  return new Promise(function(resolve, reject) {

    let huge_list = false,
      instruction = "";

    const filter = cMessage => cMessage.author.id == Message.author.id;
    const collector = Message.channel.createMessageCollector(filter, {
      time: 60000
    });

    let user_areas = sub.toLowerCase().split(","),
      area_list = "",
      list_array = [];

    let count = 0;
    AreaArray.forEach((area, index) => {
      if (count == 50) {
        count = 0;
        list_array.push(area_list);
        area_list = "";
      }
      if (user_areas.indexOf(area.toLowerCase()) >= 0) {
        area_list += area + " " + WDR.Emotes.checkYes + "\n";
      } else {
        area_list += area + "\n";
      }
      if (index == (AreaArray.length - 1)) {
        list_array.push(area_list);
      }
      count++;
    });

    switch (type) {
      // AREA NAME EMBED
      case "Name":
        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
          .setTitle("What Area would you like to Subscribe to?")
          .setDescription("**" + list_array[0] + "**" + "\n" + "\n" +
            "Page **1** of **" + list_array.length + "**")
          .setFooter(requirements);
        break;

        // REMOVAL EMBED
      case "Remove":
        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
          .setTitle("What Area do you want to remove?")
          .setDescription("**" + list_array[0] + "**" + "\n" + "\n" +
            "Page **1** of **" + list_array.length + "**")
          .setFooter(requirements);
        break;
    }

    Message.channel.send(instruction).catch(console.error).then(msg => {
      let page = 1;
      if (AreaArray.length > 50) {
        msg.react("⬅️");
        msg.react("➡️");
        WDR.Bot.on('messageReactionAdd', (reaction, user) => {
          let new_desc = new WDR.DiscordJS.MessageEmbed();
          if (reaction.emoji.name === "⬅️") {
            reaction.users.remove(user.id);
            if (page > 1) {
              page = page - 1;
              new_desc.setDescription("**" + list_array[(page - 1)] + "**" + "\n" + "\n" +
                "Page **" + page + "** of **" + list_array.length + "**");
            }
          } else if (reaction.emoji.name === "➡️") {
            reaction.users.remove(user.id);
            if (page < list_array.length) {
              page = page + 1;
              new_desc.setDescription("**" + list_array[(page - 1)] + "**" + "\n" + "\n" +
                "Page **" + page + "** of **" + list_array.length + "**");
              msg.edit(new_desc);
            }
          } else {
            reaction.remove();
          }
        });
      }

      // FILTER COLLECT EVENT
      collector.on("collect", CollectedMessage => {
        switch (true) {
          case CollectedMessage.content.toLowerCase() == "cancel":
            collector.stop("cancel");
            break;

            // AREA NAME
          case type.indexOf("Name") >= 0:
          case type.indexOf("Remove") >= 0:
            if (CollectedMessage.content.toLowerCase() == "all") {
              collector.stop("all");
              break;
            }
            for (let a = 0; a < AreaArray.length + 1; a++) {
              if (a == AreaArray.length) {
                CollectedMessage.reply("`" + CollectedMessage.content + "` doesn\'t appear to be a valid Area. Please check the spelling and try again.").then(m => m.delete({
                  timeout: 5000
                })).catch(console.error);
                break;
              } else if (CollectedMessage.content.toLowerCase() == AreaArray[a].toLowerCase()) {
                collector.stop(AreaArray[a]);
                break;
              }
            }
            break;
        }
      });

      // COLLECTOR ENDED
      collector.on("end", (collected, reason) => {
        msg.delete();
        resolve(reason);
      });
    });
  });
}