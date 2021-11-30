Logger.log("Bot start!!");
function doPost(e) {
  if(e.postData.type !== "application/json") return;
  initBot();
  this.update = JSON.parse(e.postData.contents);
  Logger.log(this.update);
  bot._processUpdates(this.update);
}


function setWebhook() {
  initBot();
  var result = bot.setWebhook({url: ScriptApp.getService().getUrl()});
  Logger.log(result);
}

function unsetWebhook() {
  initBot();
  var result = bot.setWebhook({url: ""});
  Logger.log(result);
}
