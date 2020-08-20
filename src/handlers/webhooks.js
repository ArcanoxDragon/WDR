module.exports = async (WDR, Payload) => {

  for (let p = 0, plen = Payload.length; p < plen; p++) {
    let data = Payload[p];
    //Payload.forEach(async data => {

    for (let d = 0, dlen = WDR.Discords.length; d < dlen; d++) {
      let discord = WDR.Discords[d];

      let object = data.message;

      object.Discord = discord;

      if (WDR.PointInGeoJSON.polygon(object.Discord.geofence, [object.longitude, object.latitude])) {

        object.Time_Now = new Date().getTime();

        object.Timezone = WDR.GeoTz(object.Discord.geofence[0][1][1], object.Discord.geofence[0][1][0])[0];

        object.area = {};
        object.area.default = object.Discord.name;

        if (object.Discord.geojson_file && object.Discord.geojson_file != "") {
          object.area = await WDR.Get_Areas(WDR, object);
        }

        if (object.area.sub) {
          object.area.embed = object.area.sub;
        } else if (object.area.main && !object.area.sub) {
          object.area.embed = object.area.main;
        } else if (!object.area.sub && !object.area.main) {
          object.area.embed = object.area.default;
        }

        if (WDR.Config.DEBUG.Processing_Speed == "ENABLED") {
          object.WDR_Received = new Date().getTime();
        }

        if (data.type == "pokemon") {

          if (object.cp > 0) {

            object.gen = await WDR.Get_Gen(object.pokemon_id);

            object.weather_boost = await WDR.Get_Weather(WDR, object);
            if (object.weather_boost == undefined) {
              WDR.Console.error(WDR, "[handlers/webhooks.js] Undefined Emoji for Weather ID " + object.weather + ". Emoji does not exist in defined emoji server(s).");
            }

            object.size = await WDR.Get_Size(WDR, object.pokemon_id, object.form, object.height, object.weight);

            object = await WDR.Get_Locale.Pokemon(WDR, object);

            object.internal_value = (Math.floor(((object.individual_defense + object.individual_stamina + object.individual_attack) / 45) * 1000) / 10);

            if (object.gender == 1) {
              object.gender_name = "male";
              object.gender_id = 1;
            } else if (object.gender == 2) {
              object.gender_name = "female";
              object.gender_id = 2;
            } else {
              delete object.gender;
              object.gender_name = "all";
              object.gender_id = 0;
            }
            if (object.gender) {
              object.gender_wemoji = await WDR.Capitalize(object.gender_name) + " " + WDR.Emotes[object.gender_name];
              object.gender_noemoji = await WDR.Capitalize(object.gender_name);
            }

            WDR.Subscriptions.Pokemon(WDR, object);

            WDR.Feeds.Pokemon(WDR, object);

            if (object.pvp_rankings_great_league) {
              object.great_league = object.pvp_rankings_great_league;
            } else {
              object.great_league = await WDR.PvP.CalculatePossibleCPs(WDR, object.pokemon_id, object.form_id, object.individual_attack, object.individual_defense, object.individual_stamina, object.pokemon_level, object.gender_name, "great", "webhook.js great");
            }

            if (object.pvp_rankings_ultra_league) {
              object.ultra_league = object.pvp_rankings_great_league;
            } else {
              object.ultra_league = await WDR.PvP.CalculatePossibleCPs(WDR, object.pokemon_id, object.form_id, object.individual_attack, object.individual_defense, object.individual_stamina, object.pokemon_level, object.gender_name, "ultra", "webhook.js ultra");
            }

            WDR.Subscriptions.PvP(WDR, object);

            WDR.Feeds.PvP(WDR, object);
          } else {

            //WDR.Feeds.NoIVPokemon(WDR, object);
            //WDR.Subscriptions.NoIVPokemon(WDR, object);
          }

        } else if (data.type == "raid") {

          object = await WDR.Get_Locale.Pokemon(WDR, object);

          WDR.Feeds.Raids(WDR, object);

          //WDR.Subscriptions.Raids(WDR, object);

        } else if (data.type == "quest") {

          object = await WDR.Get_Quest_Reward(WDR, object);

          object = await WDR.Get_Quest_Task(WDR, object);

          WDR.Feeds.Quests(WDR, object);

          //WDR.Subscriptions.Quests(WDR, object);

        } else if (data.type == "pokestop") {

          WDR.Feeds.Lures(WDR, object);

          //WDR.Subscriptions.Lures(WDR, object);

        } else if (data.type == "invasion") {

          WDR.Feeds.Invasions(WDR, object);

          //WDR.Subscriptions.Invasions(WDR, object);
        }
      }
    }
  } //);

  // END
  return;
}

function Calculate_Size(pokemon_id) {
  let weightRatio = 0,
    heightRatio = 0;
  if (form_id > 0) {
    let form_weight = WDR.Master.Pokemon[pokemon_id].forms[form_id].weight ? WDR.Master.Pokemon[pokemon_id].forms[form_id].weight : WDR.Master.Pokemon[pokemon_id].weight;
    let form_height = WDR.Master.Pokemon[pokemon_id].forms[form_id].height ? WDR.Master.Pokemon[pokemon_id].forms[form_id].height : WDR.Master.Pokemon[pokemon_id].height;
    weightRatio = object.weight / form_weight;
    heightRatio = object.height / form_height;
  } else {
    weightRatio = object.weight / WDR.Master.Pokemon[pokemon_id].weight;
    heightRatio = object.height / WDR.Master.Pokemon[pokemon_id].height;
  }

  let size = heightRatio + weightRatio;

  switch (true) {
    case size < 1.5:
      return resolve('Tiny');
    case size <= 1.75:
      return resolve('Small');
    case size < 2.25:
      return resolve('Normal');
    case size <= 2.5:
      return resolve('Large');
    default:
      return resolve('Big');
  }
}