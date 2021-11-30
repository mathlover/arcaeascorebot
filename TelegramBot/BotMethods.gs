function Bot(token) {
  if (token === undefined) {
    throw new Error('Please provide a Telegram bot token when instantiating');
  }
  this._token = token;
  this._events = {};
  this._eventsCount = 0;
}


Bot.prototype._request = function (method, params, formData) {
  if (arguments.length === 0 || typeof arguments[0] !== 'string') {
    throw new Error('Please provide method as a string');
  }

  // the 2nd, 3rd or 4th argument could be a callback
  var callback;
  if (typeof arguments[3] == 'function') {
    callback = arguments[3];
  } else if (typeof arguments[2] == 'function') {
    callback = arguments[2];
    formData = null;
  } else if (typeof arguments[1] == 'function') {
    callback = arguments[1];
    params = null;
  }

  var options = {
    'method': 'post',
    'contentType': 'application/json',
    'payload' : JSON.stringify(params)
  };

  var resp = UrlFetchApp.fetch('https://api.telegram.org/bot' + this._token + '/' + method, options);
  if (resp.getResponseCode() !== 200) {
    throw new Error(resp.statusCode + ':\n' + resp.body);
  }
  var updates = JSON.parse(resp.body||resp);
  if (updates.ok) {
    if (callback) {
      callback(null, updates);
    }
    return updates;
  }
  return null;
}

Bot.prototype.getMe = function (callback) {
  return this._request('getMe', callback);
}

Bot.prototype.getUpdates = function (offset, callback) {
  var params = {
    offset: offset,
    timeout: 10
  };

  return this._request('getUpdates', params, callback);
}

Bot.prototype.setWebhook = function (url, optionalParams, callback) {
  return this._request('setWebhook', url, optionalParams, callback);
}

Bot.prototype.deleteWebhook = function (callback) {
  return this._request('deleteWebhook', callback);
}

Bot.prototype.getWebhookInfo = function (callback) {
  return this._request('getWebhookInfo', callback);
}

Bot.prototype.sendMessage = function (chatId, text, optionalParams, callback) {
  var params = {
    chat_id: chatId,
    text: text
  };

  if (typeof optionalParams == 'function') {
    callback = optionalParams;
  } else {
    Object.assign(params, optionalParams, callback);
  }

  return this._request('sendMessage', params, callback);
}

Bot.prototype.answerCallbackQuery = function (callbackQueryId, optionalParams, callback) {
  var params = {
    callback_query_id: callbackQueryId
  };

  if (typeof optionalParams == 'function') {
    callback = optionalParams;
  } else {
    Object.assign(params, optionalParams);
  }

  return this._request('answerCallbackQuery', params, callback);
}

Bot.prototype.editMessageText = function (chatId, messageId, text, optionalParams, callback) {
  var params = {
    chat_id: chatId,
    message_id: messageId,
    text: text
  };

  if (typeof optionalParams == 'function') {
    callback = optionalParams;
  } else {
    Object.assign(params, optionalParams);
  }

  return this._request('editMessageText', params, callback);
}

Bot.prototype.editInlineMessageText = function (inlineMessageId, text, optionalParams, callback) {
  var params = {
    inline_message_id: inlineMessageId,
    text: text
  };

  if (typeof optionalParams == 'function') {
    callback = optionalParams;
  } else {
    Object.assign(params, optionalParams);
  }

  return this._request('editMessageText', params, callback);
}

Bot.prototype.editMessageCaption = function (chatId, messageId, caption, optionalParams, callback) {
  var params = {
    chat_id: chatId,
    message_id: messageId,
    caption: caption
  };

  if (typeof optionalParams == 'function') {
    callback = optionalParams;
  } else {
    Object.assign(params, optionalParams);
  }

  return this._request('editMessageCaption', params, callback);
}

Bot.prototype.editInlineMessageCaption = function (inlineMessagId, caption, optionalParams, callback) {
  var params = {
    inline_message_id: inlineMessageId,
    caption: caption
  };

  if (typeof optionalParams == 'function') {
    callback = optionalParams;
  } else {
    Object.assign(params, optionalParams);
  }

  return this._request('editMessageCaption', params, callback);
}

Bot.prototype.editMessageReplyMarkup = function (chatId, messageId, replyMarkup, callback) {
  var params = {
    chat_id: chatId,
    message_id: messageId,
    reply_markup: replyMarkup
  }

  return this._request('editMessageReplyMarkup', params, callback);
}

Bot.prototype.editInlineMessageReplyMarkup = function (inlineMessageId, replyMarkup, callback) {
  var params = {
    inline_message_id: inlineMessageId,
    reply_markup: replyMarkup
  }

  return this._request('editMessageReplyMarkup', params, callback);
}

Bot.prototype.deleteMessage = function (chatId, messageId, callback) {
  var params = {
    chat_id: chatId,
    message_id: messageId
  }

  return this._request('deleteMessage', params, callback);
}

Bot.prototype.answerInlineQuery = function (inlineQueryId, results, optionalParams, callback) {
  var params = {
    inline_query_id: inlineQueryId,
    results: results
  };

  if (typeof optionalParams == 'function') {
    callback = optionalParams;
  } else {
    Object.assign(params, optionalParams);
  }

  return this._request('answerInlineQuery', params, callback);
}

Bot.prototype.forwardMessage = function (chatId, fromChatId, messageId, optionalParams, callback) {
  var params = {
    chat_id: chatId,
    from_chat_id: fromChatId,
    message_id: messageId
  }

  if (typeof optionalParams == 'function') {
    callback = optionalParams;
  } else {
    Object.assign(params, optionalParams);
  }

  return this._request('forwardMessage', params, callback);
}

Bot.prototype.sendPhoto = function (chatId, photo, optionalParams, callback) {
  var params = {
    chat_id: chatId,
    photo: photo
  };

  var formData = {
    photo: photo
  };

  if (typeof optionalParams == 'function') {
    callback = optionalParams;
  } else {
    Object.assign(params, optionalParams);
  }

  return this._request('sendPhoto', params, formData, callback);
}

Bot.prototype.sendAudio = function (chatId, audio, optionalParams, callback) {
  var params = {
    chat_id: chatId,
    audio: audio
  };

  var formData = {
    audio: audio
  };

  // write test for file size limit

  if (typeof optionalParams == 'function') {
    callback = optionalParams;
  } else {
    Object.assign(params, optionalParams);
  }

  return this._request('sendAudio', params, formData, callback);
}

Bot.prototype.sendDocument = function (chatId, document, optionalParams, callback) {
  var params = {
    chat_id: chatId,
    document: document
  };

  var formData = {
    document: document
  };

  // write test for file size limit

  if (typeof optionalParams == 'function') {
    callback = optionalParams;
  } else {
    Object.assign(params, optionalParams);
  }

  return this._request('sendDocument', params, formData, callback);
}

// Stickers

Bot.prototype.sendSticker = function (chatId, sticker, optionalParams, callback) {
  var params = {
    chat_id: chatId,
    sticker: sticker
  };

  var formData = {
    sticker: sticker
  };

  if (typeof optionalParams == 'function') {
    callback = optionalParams;
  } else {
    Object.assign(params, optionalParams);
  }

  return this._request('sendSticker', params, formData, callback);
}

Bot.prototype.getStickerSet = function (name, callback) {
  var params = {
    name: name
  }
  return this._request('getStickerSet', params, callback);
}

Bot.prototype.uploadStickerFile = function (userId, pngFile, callback) {
  var params = {
    user_id: userId,
    png_sticker: pngFile
  };

  var formData = {
    png_sticker: pngFile
  };

  return this._request('uploadStickerFile', params, formData, callback);
}

Bot.prototype.createNewStickerSet = function (userId, name, title, pngFile, emojis, optionalParams, callback) {
  var params = {
    user_id: userId,
    name: name,
    title: title,
    png_sticker: pngFile,
    emojis: emojis
  };

  var formData = {
    png_sticker: pngFile
  };

  if (typeof optionalParams == 'function') {
    callback = optionalParams;
  } else {
    Object.assign(params, optionalParams);
  }

  return this._request('createNewStickerSet', params, formData, callback);
}

Bot.prototype.addStickerToSet = function (userId, name, pngFile, emojis, optionalParams, callback) {
  var params = {
    user_id: userId,
    name: name,
    png_sticker: pngFile,
    emojis: emojis
  };

  var formData = {
    png_sticker: pngFile
  };

  if (typeof optionalParams == 'function') {
    callback = optionalParams;
  } else {
    Object.assign(params, optionalParams);
  }

  return this._request('addStickerToSet', params, formData, callback);
}

Bot.prototype.setStickerPositionInSet = function (sticker, position, callback) {
  var params = {
    sticker: sticker,
    position: position
  }

  return this._request('setStickerPositionInSet', params, callback);
}

Bot.prototype.deleteStickerFromSet = function (sticker, callback) {
  var params = {
    sticker: sticker
  }

  return this._request('deleteStickerFromSet', params, callback);
}

Bot.prototype.sendVideo = function (chatId, video, optionalParams, callback) {
  var params = {
    chat_id: chatId,
    video: video
  };

  var formData = {
    video: video
  };

  // write test for file size limit
  // write test for file size type (only .mp4)

  if (typeof optionalParams == 'function') {
    callback = optionalParams;
  } else {
    Object.assign(params, optionalParams);
  }

  return this._request('sendVideo', params, callback);
}

Bot.prototype.sendVoice = function (chatId, voice, optionalParams, callback) {
  var params = {
    chat_id: chatId,
    voice: voice
  };

  var formData = {
    voice: voice
  };

  // write test for file size limit
  // write test for file size type (only .ogg encoded in OPUS)

  if (typeof optionalParams == 'function') {
    callback = optionalParams;
  } else {
    Object.assign(params, optionalParams);
  }

  return this._request('sendVoice', params, callback);
}

Bot.prototype.sendVideoNote = function (chatId, videoNote, optionalParams, callback) {
  var params = {
    chat_id: chatId,
    video_note: videoNote
  };

  var formData = {
    video_note: videoNote
  };

  // write test for file size limit
  // write test for file size type (only .ogg encoded in OPUS)

  if (typeof optionalParams == 'function') {
    callback = optionalParams;
  } else {
    Object.assign(params, optionalParams);
  }

  return this._request('sendVideoNote', params, callback);
}

Bot.prototype.sendMediaGroup = function (chatId, media, optionalParams, callback) {
  var params = {
    chat_id: chatId,
    media: media
  };

  if (typeof optionalParams == 'function') {
    callback = optionalParams;
  } else {
    Object.assign(params, optionalParams);
  }

  return this._request('sendMediaGroup', params, callback);
}

Bot.prototype.sendLocation = function (chatId, lat, lon, optionalParams, callback) {
  var params = {
    chat_id: chatId,
    latitude: lat,
    longitude: lon
  };

  if (typeof optionalParams == 'function') {
    callback = optionalParams;
  } else {
    Object.assign(params, optionalParams);
  }

  return this._request('sendLocation', params, callback);
}

Bot.prototype.editMessageLiveLocation = function (chatId, messageId, lat, lon, optionalParams, callback) {
  var params = {
    chat_id: chatId,
    message_id: messageId,
    latitude: lat,
    longitude: lon
  }

  if (typeof optionalParams == 'function') {
    callback = optionalParams;
  } else {
    Object.assign(params, optionalParams);
  }

  return this._request('editMessageLiveLocation', params, callback);
}

Bot.prototype.editInlineMessageLiveLocation = function (inlineMessageId, lat, lon, optionalParams, callback) {
  var params = {
    inline_message_id: inlineMessageId,
    latitude: lat,
    longitude: lon
  }

  if (typeof optionalParams == 'function') {
    callback = optionalParams;
  } else {
    Object.assign(params, optionalParams);
  }

  return this._request('editMessageLiveLocation', params, callback);
}

Bot.prototype.stopMessageLiveLocation = function (chatId, messageId, optionalParams, callback) {
  var params = {
    chat_id: chatId,
    message_id: messageId
  }

  if (typeof optionalParams == 'function') {
    callback = optionalParams;
  } else {
    Object.assign(params, optionalParams);
  }

  return this._request('stopMessageLiveLocation', params, callback);
}

Bot.prototype.stopInlineMessageLiveLocation = function (inlineMessageId, optionalParams, callback) {
  var params = {
    inline_message_id: inlineMessageId
  }

  if (typeof optionalParams == 'function') {
    callback = optionalParams;
  } else {
    Object.assign(params, optionalParams);
  }

  return this._request('stopMessageLiveLocation', params, callback);
}

Bot.prototype.sendVenue = function (chatId, lat, lon, title, address, optionalParams, callback) {
  var params = {
    chat_id: chatId,
    latitude: lat,
    longitude: lon,
    title: title,
    address: address
  }

  if (typeof optionalParams == 'function') {
    callback = optionalParams;
  } else {
    Object.assign(params, optionalParams);
  }

  return this._request('sendVenue', params, callback);
}

Bot.prototype.sendContact = function (chatId, phoneNumber, firstName, optionalParams, callback) {
  var params = {
    chat_id: chatId,
    phone_number: phoneNumber,
    first_name: firstName
  }

  if (typeof optionalParams == 'function') {
    callback = optionalParams;
  } else {
    Object.assign(params, optionalParams);
  }

  return this._request('sendContact', params, callback);
}

Bot.prototype.sendChatAction = function (chatId, action, callback) {
  if (typeof action !== 'string') {
    throw new Error('sendChatAction method needs a string input');
  }

  var params = {
    chat_id: chatId,
    action: action
  };

  return this._request('sendChatAction', params, callback);
}

Bot.prototype.getUserProfilePhotos = function (userId, optionalParams, callback) {
  var params = {
    user_id: userId,
  };

  if (typeof optionalParams == 'function') {
    callback = optionalParams;
  } else {
    Object.assign(params, optionalParams);
  }

  return this._request('getUserProfilePhotos', params, callback);
}

Bot.prototype.getFile = function (fileId, callback) {
  var params = {
    file_id: fileId
  };

  return this._request('getFile', params, callback);
}

Bot.prototype.kickChatMember = function (chatId, userId, optionalParams, callback) {
  var params = {
    chat_id: chatId,
    user_id: userId
  };

  if (typeof optionalParams == 'function') {
    callback = optionalParams;
  } else {
    Object.assign(params, optionalParams);
  }

  return this._request('kickChatMember', params, callback);
}

Bot.prototype.leaveChat = function (chatId, callback) {
  var params = {
    chat_id: chatId
  };

  return this._request('leaveChat', params, callback);
}

Bot.prototype.unbanChatMember = function (chatId, userId, callback) {
  var params = {
    chat_id: chatId,
    user_id: userId
  };

  return this._request('unbanChatMember', params, callback);
}

Bot.prototype.restrictChatMember = function (chatId, userId, optionalParams, callback) {
  var params = {
    chat_id: chatId,
    user_id: userId
  }

  if (typeof optionalParams == 'function') {
    callback = optionalParams;
  } else {
    Object.assign(params, optionalParams);
  }

  return this._request('restrictChatMember', params, callback);
}

Bot.prototype.promoteChatMember = function (chatId, userId, optionalParams, callback) {
  var params = {
    chat_id: chatId,
    user_id: userId
  }

  if (typeof optionalParams == 'function') {
    callback = optionalParams;
  } else {
    Object.assign(params, optionalParams);
  }

  return this._request('promoteChatMember', params, callback);
}

Bot.prototype.exportChatInviteLink = function (chatId, callback) {
  var params = {
    chat_id: chatId
  }

  return this._request('exportChatInviteLink', params, callback);
}

Bot.prototype.setChatPhoto = function (chatId, photo, callback) {
  var params = {
    chat_id: chatId,
    photo: photo
  };

  var formData = {
    photo: photo
  };

  return this._request('setChatPhoto', params, formData, callback);
}

Bot.prototype.deleteChatPhoto = function (chatId, callback) {
  var params = {
    chat_id: chatId
  }

  return this._request('deleteChatPhoto', params, callback);
}

Bot.prototype.setChatTitle = function (chatId, title, callback) {
  var params = {
    chat_id: chatId,
    title: title
  }

  return this._request('setChatTitle', params, callback);
}

Bot.prototype.setChatDescription = function (chatId, description, callback) {
  var params = {
    chat_id: chatId,
    description: description
  }

  return this._request('setChatDescription', params, callback);
}

Bot.prototype.pinChatMessage = function (chatId, messageId, optionalParams, callback) {
  var params = {
    chat_id: chatId,
    message_id: messageId
  }

  if (typeof optionalParams == 'function') {
    callback = optionalParams;
  } else {
    Object.assign(params, optionalParams);
  }

  return this._request('pinChatMessage', params, callback);
}

Bot.prototype.unpinChatMessage = function (chatId, callback) {
  var params = {
    chat_id: chatId
  }

  return this._request('unpinChatMessage', params, callback);
}

Bot.prototype.getChat = function (chatId, callback) {
  var params = {
    chat_id: chatId
  };

  return this._request('getChat', params, callback);
}

Bot.prototype.getChatAdministrators = function (chatId, callback) {
  var params = {
    chat_id: chatId
  };

  return this._request('getChatAdministrators', params, callback);
}

Bot.prototype.getChatMembersCount = function (chatId, callback) {
  var params = {
    chat_id: chatId
  };

  return this._request('getChatMembersCount', params, callback);
}

Bot.prototype.getChatMember = function (chatId, userId, callback) {
  var params = {
    chat_id: chatId,
    user_id: userId
  };

  return this._request('getChatMember', params, callback);
}

Bot.prototype.setChatStickerSet = function (chatId, stickerSetName, callback) {
  var params = {
    chat_id: chatId,
    sticker_set_name: stickerSetName
  }

  return this._request('setChatStickerSet', params, callback);
}

Bot.prototype.deleteChatStickerSet = function (chatId, callback) {
  var params = {
    chat_id: chatId
  }

  return this._request('deleteChatStickerSet', params, callback);
}

// Payment

Bot.prototype.sendInvoice = function (chatId, title, description, payload, providerToken, startParameter, currency, prices, optionalParams, callback) {
  var params = {
    chat_id: chatId,
    title: title,
    description: description,
    payload: payload,
    provider_token: providerToken,
    start_parameter: startParameter,
    currency: currency,
    prices: prices
  };

  if (typeof optionalParams == 'function') {
    callback = optionalParams;
  } else {
    Object.assign(params, optionalParams);
  }

  return this._request('sendInvoice', params, callback);
}

Bot.prototype.answerShippingQuery = function (shippingQueryId, ok, callback) {
  var params = {
    shipping_query_id: shippingQueryId,
    ok: ok
  };

  if (typeof optionalParams == 'function') {
    callback = optionalParams;
  } else {
    Object.assign(params, optionalParams);
  }

  return this._request('answerShippingQuery', params, callback);
}

Bot.prototype.answerPreCheckoutQuery = function (preCheckoutQueryId, ok, errorMessage) {
  var params = {
    pre_checkout_query_id: preCheckoutQueryId,
    ok: ok,
    error_message: errorMessage
  };

  return this._request('answerShippingQuery', params, callback);
}

// Games

Bot.prototype.sendGame = function (chatId, gameShortName, optionalParams, callback) {
  var params = {
    chat_id: chatId,
    game_short_name: gameShortName
  };

  if (typeof optionalParams == 'function') {
    callback = optionalParams;
  } else {
    Object.assign(params, optionalParams);
  }

  return this._request('sendGame', params, callback);
}

Bot.prototype.setGameScore = function (userId, score, optionalParams, callback) {
  var params = {
    user_id: userId,
    score: score
  }

  if (typeof optionalParams == 'function') {
    callback = optionalParams;
  } else {
    Object.assign(params, optionalParams);
  }

  return this._request('setGameScore', params, callback);
}

Bot.prototype.getGameHighScores = function (userId, optionalParams, callback) {
  var params = {
    user_id: userId
  };

  if (typeof optionalParams == 'function') {
    callback = optionalParams;
  } else {
    Object.assign(params, optionalParams);
  }

  return this._request('getGameHighScores', params, callback);
}



Bot.prototype.on = function addListener(evt, fn, context) {
  if (typeof fn !== 'function') throw new TypeError('The listener must be a function');
  var listener = {fn: fn, context: context || this};
  if (!this._events[evt]) this._events[evt] = listener, this._eventsCount++;
  else if (!this._events[evt].fn) this._events[evt].push(listener);
  else this._events[evt] = [this._events[evt], listener];
  return true;
}

Bot.prototype.emit = function emit(evt, param) {
  if (!this._events[evt]) return false;
  var listeners = this._events[evt];
  if (listeners.fn) return listeners.fn.call(listeners.context, param), true;
};

Bot.prototype._processUpdates = function(update) {
  var message = update.message;
  var editedMessage = update.edited_message;
  var channelPost = update.channel_post;
  var editedChannelPost = update.edited_channel_post;
  var callbackQuery = update.callback_query;
  var inlineQuery = update.inline_query;
  var chosenInlineResult = update.chosen_inline_result;
  var shippingQuery = update.shipping_query;
  var preCheckoutQuery = update.pre_checkout_query;

  if (message) {
    this.emit('message', message);
  } else if (editedMessage) {
    this.emit('edited_message', editedMessage);
  } else if (channelPost) {
    this.emit('channel_post', channelPost);
  } else if (editedChannelPost) {
    this.emit('edited_channel_post', editedChannelPost);
  } else if (callbackQuery) {
    this.emit('callback_query', callbackQuery);
  } else if (inlineQuery) {
    this.emit('inline_query', inlineQuery);
  } else if (chosenInlineResult) {
    this.emit('chosen_inline_result', chosenInlineResult);
  } else if (shippingQuery) {
    this.emit('shipping_query', shippingQuery);
  } else if (preCheckoutQuery) {
    this.emit('pre_checkout_query', preCheckoutQuery)
  }
}


if (!Object.assign) {
  Object.defineProperty(Object, "assign", {
    enumerable: false,
    configurable: true,
    writable: true,
    value: function (target, firstSource) {
      "use strict";
      if (target === undefined || target === null)
        throw new TypeError("Cannot convert first argument to object");
      var to = Object(target);
      for (var i = 1; i < arguments.length; i++) {
        var nextSource = arguments[i];
        if (nextSource === undefined || nextSource === null) continue;
        var keysArray = Object.keys(Object(nextSource));
        for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
          var nextKey = keysArray[nextIndex];
          var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
          if (desc !== undefined && desc.enumerable) to[nextKey] = nextSource[nextKey];
        }
      }
      return to;
    }
  });
}

