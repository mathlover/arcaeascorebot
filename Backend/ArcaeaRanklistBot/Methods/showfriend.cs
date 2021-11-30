using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Text;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using WebSocketSharp;
using WebSocketSharp.Server;

namespace ArcaeaRanklistBot.Methods
{
    public static class Showfriend
    {
        public static void go(ILogger logger, List<Account>accountlist, HttpRequestEventArgs httpRequestEventArgs)
        {
            logger.Log(TraceEventType.Information, "show the friends of special account");
            Dictionary<string, List<string>> dict = new Dictionary<string, List<string>>();
            for (int i = 0; i < accountlist.Count; ++i)
            {
                string userinfo = libarc.getuserinfo(accountlist[i].token);
                JObject jo = JObject.Parse(userinfo);
                var friends = jo["value"]["friends"].Children();
                string name = (string)jo["value"]["name"];
                List<string> friendlist = new List<string>();
                foreach (var friend in friends)
                {
                    friendlist.Add((string)friend["name"]);
                }
                dict.Add(name, friendlist);
            }

            if (httpRequestEventArgs != null)
            {
                var bytes = Encoding.UTF8.GetBytes(JsonConvert.SerializeObject(dict));
                httpRequestEventArgs.Response.StatusCode = 200;
                httpRequestEventArgs.Response.WriteContent(bytes);
            }
            else
            {
                logger.Log(TraceEventType.Information, JsonConvert.SerializeObject(dict, Formatting.Indented));
            }
        }
    }
}
