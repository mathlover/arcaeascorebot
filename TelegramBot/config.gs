var properties = {
    Author: "@mathlover",
    botName: "arcaeascorebot",
    botToken: "{Your telegram bot token}",
    logChannel: "",
    debugChatId: ""
  }
this.cfg = {
  bot: {
    token: properties['botToken'],
    name: properties['botName'],
    logChannelId: properties['logChannel'],
    debugChatId: properties['debugChatId']
  },
  msg: {
    start: "欢迎来到Arcaea的世界！",
    help: "/event 查询当前限时活动\ninline模式下加arcaea id可以查询最近打歌记录，若已绑定arcaea id可以不输入id。回复任何已经绑定的人也可以查询对方的最近打歌记录\n绑定方法：/register {你的arcaeaid}，如果需要解除绑定可以联系 @mathlover 解绑\n/pttranklist 可以查询群地位\n/songranklist {songid} [{difficulty}] 可以查询歌榜，难度为空默认为future，回复bot发出来的最近打歌记录可以查询该难度下的歌榜，无需加参数\n 有什么疑问或者报告bug或者提出需求或者讨论arcaea或者讨论telegram bot都可以联系 @mathlover \n祝各位玩的愉快，早日双星！",
  },
  backend:{
    Endpoint: "http://{Your VM address}:616/"
  },
}
