using System;
using WebSocketSharp;
using System.Text;
using System.IO;
using System.Diagnostics;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using WebSocketSharp.Server;
using System.Threading.Tasks;
using System.Collections;
using ArcaeaRanklistBot.Methods;
using System.IO.Compression;

namespace ArcaeaRanklistBot
{
    public class Account
    {
        public string username;
        public string password;
        public string guid;
        public string token;
        public List<string> friends;
    }
    public static class Program
    {
        private static readonly ILogger logger = new ConsoleLogger();
        private static int eventId; 

        public static Dictionary<string, song> list = null;
        public static List<Songplay> songplaylist = new List<Songplay>();
        public static List<User> userlist;
        public static Dictionary<string, string> alias2songid;
        public static Dictionary<string, List<Songplay>> history = new Dictionary<string, List<Songplay>>();
        public static Dictionary<string, string> othersmessage;
        public static List<Account> specialaccount = new List<Account>();
        internal static Dictionary<string, Best30data> Best30 = new Dictionary<string, Best30data>();

        static void Main(string[] args)
        {
            initobject();
            HttpServer server = new HttpServer(616);
            server.OnGet += OnGet;
            server.Start();
            Console.ReadKey();
            return;
        }

        static string print(List<Songplay> list, int pg)
        {
            StringBuilder sb = new StringBuilder();
            var count = list.Count;
            sb.Append($"#{pg}\r\n");
            sb.Append(list[pg - 1].Show());
            sb.Append($"\r\nPage:{pg + 1}/{count}");
            return sb.ToString();
        }

        public static T loadobject<T>(string filename)
        {
            T obj;
            if (File.Exists(filename) == false)
                return default(T);
            using (StreamReader sr = new StreamReader(File.Open(filename, FileMode.Open)))
            {
                string line = sr.ReadToEnd();
                obj = (JsonConvert.DeserializeObject<T>(line));
            }
            return obj;
        }
        public static void saveobject(string filename, object obj)
        {
            using (StreamWriter sw = new StreamWriter(File.Create(filename)))
            {
                sw.WriteLine(JsonConvert.SerializeObject(obj, Formatting.Indented));
            }
        }

        public static void Debug(string output, string file)
        {
            using (ConsoleLogger sw = new ConsoleLogger(file))
            {
                sw.Log(TraceEventType.Information, output);
            }
        }

        private static string pttranklistcache = null;
        public static void initobject()
        {
            libarc.logger = logger;
            userlist = loadobject<List<User>>("userlist.json");
            alias2songid = loadobject<Dictionary<string, string>>("alias.txt");
            pttranklistcache = loadobject<string>("pttranklistcache.txt");
            Best30 = loadobject<Dictionary<string, Best30data>>("Best30cache.json");
            LoadAccountList();
            eventId = 0;
            logger.Log(TraceEventType.Start, "Start the Backend!");
        }
        public static Dictionary<string, Account> accountlist = new Dictionary<string, Account>();
        public static void updatexiaohaolist()
        {
            using (StreamWriter sw = new StreamWriter(File.Create("register.txt")))
            {
                foreach (var i in accountlist)
                {
                    var x = i.Value;
                    sw.WriteLine($"{x.username}|{x.password}|{x.guid}|{x.token}");
                }
            }
        }
        public static void LoadAccountList()
        {
            using (StreamReader sr = new StreamReader(File.Open("register.txt", FileMode.Open)))
            {
                while (sr.EndOfStream == false)
                {
                    string line = sr.ReadLine();
                    string[] split = line.Split('|');
                    Account x = new Account
                    {
                        username = split[0],
                        password = split[1],
                        guid = split[2]
                    };
                    if (split.Length > 3)
                        x.token = split[3];
                    else
                    {
                        x.token = libarc.login(x.username, x.password, x.guid);
                    }
                    accountlist.Add(x.username, x);
                }
            }
            logger.Log(TraceEventType.Information, "Initialize the accounts...");
            using (StreamReader sr = new StreamReader(File.Open("specialaccount.txt", FileMode.Open)))
            {
                while (sr.EndOfStream == false)
                {
                    string line = sr.ReadLine();
                    string[] split = line.Split('|');
                    Account x = new Account
                    {
                        username = split[0],
                        password = split[1],
                        guid = split[2]
                    };
                    if (split.Length > 3)
                        x.token = split[3];
                    else
                    {
                        x.token = libarc.login(x.username, x.password, x.guid);
                    }
                    specialaccount.Add(x);
                }
            }
            logger.Log(TraceEventType.Information, "Initialize the special accounts...");
        }

        public static Tuple<string, string, Dictionary<string, string>> RequestParser(string request)
        {
            string[] lines = request.Split('\n');
            string[] split = lines[0].Split(' ');
            Dictionary<string, string> keyValuePairs = new Dictionary<string, string>();
            string func = split[1].Substring(1, split[1].IndexOf('?') - 1);
            foreach (var i in split[1].Substring(split[1].IndexOf('?') + 1).Split('&'))
            {
                var keyvalue = i.Split('=');
                keyValuePairs.Add(keyvalue[0], keyvalue[1]);
            }
            return new Tuple<string, string, Dictionary<string, string>>(split[0], func, keyValuePairs);
        }

        public static double Calculateptt(int score, string songid, Difficulty difficulty)
        {
            double constant = SongDB.Instance.GetSongbyId(songid).constant[(int)difficulty];
            if (score >= 10000000)
                return constant + 2;
            else if (score > 9800000)
                return constant + 1.0 + (score - 9800000) / 200000.0;
            else return Math.Max(0, constant + (score - 9500000) / 300000.0);
        }

        public static void OnGet(object sender, HttpRequestEventArgs httpRequestEventArgs)
        {
            var request = httpRequestEventArgs.Request;
            var response = httpRequestEventArgs.Response;
            response.ContentType = "text/plain; charset=utf-8";
            logger.Log(TraceEventType.Information, "Receive Get request from {0} with path {1}", request.RemoteEndPoint.Address, request.Url.AbsolutePath);
            Uri uri = request.Url;
            if (uri == null)
                return;
            var query = request.QueryString;
            byte[] bytes = null;
            if (uri.AbsolutePath == "/recent") // query recent play in pure way
            {
                if (query.Contains("id") == false)
                {
                    response.StatusCode = 200;
                    bytes = Encoding.UTF8.GetBytes("{\"status\":\"fail\",\"reason\":\"missing key id\"}");
                    httpRequestEventArgs.Response.WriteContent(bytes);
                    return;
                }
                else
                {
                    logger.Log(TraceEventType.Information, "Query the recent play of {0}", query["id"]);
                    response.StatusCode = 200;
                    response.ContentType = "text/plain;charset=UTF-8";
                    response.ContentEncoding = Encoding.UTF8;
                    response.KeepAlive = true;
                    response.StatusDescription = "OK";
                    string recent = GetRecent(query["id"]);
                    //Debug(recent, "debug.log");
                    Songplay sp = new Songplay(JObject.Parse(recent)["recent_score"].First);
                    {
                        bytes = Encoding.UTF8.GetBytes(recent);
                        httpRequestEventArgs.Response.WriteContent(bytes);
                    }
                    return;
                }
            }
            else if (uri.AbsolutePath == "/recent1") // query recent play in bot arc api
            {
                if (query.Contains("id") == false)
                {
                    response.StatusCode = 200;
                    bytes = Encoding.UTF8.GetBytes("{\"status\":\"fail\",\"reason\":\"missing key id\"}");
                    httpRequestEventArgs.Response.WriteContent(bytes);
                    return;
                }
                else
                {
                    logger.Log(TraceEventType.Information, "Query the recent play of {0}", query["id"]);
                    response.StatusCode = 200;
                    response.ContentType = "text/plain;charset=UTF-8";
                    response.ContentEncoding = Encoding.UTF8;
                    response.KeepAlive = true;
                    response.StatusDescription = "OK";
                    IWork getRecentWork = new Recent()
                    {
                        Usercode = query["id"]
                    };

                    string recent = getRecentWork.DoWork();
                    var jo = JObject.Parse(recent);
                    var recentscore = jo["content"]["recent_score"];
                    jo["content"]["recent_score"] = new JArray(recentscore);
                    bytes = Encoding.UTF8.GetBytes(jo["content"].ToString());
                    httpRequestEventArgs.Response.WriteContent(bytes);
                    return;
                }
            }
            else if (uri.AbsolutePath == "/getuser") // get usercode from telegram user id
            {
                if (query.Contains("tgid"))
                {
                    var user = userlist.GetUserbytgid(query["tgid"]);
                    if (user == null)
                    {
                        response.StatusCode = 200;
                        bytes = Encoding.UTF8.GetBytes("{\"status\":\"fail\",\"reason\":\"no such user\"}");
                        httpRequestEventArgs.Response.WriteContent(bytes);
                        return;
                    }
                    response.StatusCode = 200;
                    bytes = Encoding.UTF8.GetBytes(user.ToString());
                    httpRequestEventArgs.Response.WriteContent(bytes);
                    return;
                }
            }
            else if (uri.AbsolutePath == "/songdb") // get all song info
            {
                response.StatusCode = 200;
                bytes = Encoding.UTF8.GetBytes(SongDB.Instance.Getsongdbjson());
                httpRequestEventArgs.Response.WriteContent(bytes);
                return;
            }
            else if (uri.AbsolutePath == "/updatesongdb") // refresh song db
            {
                string result = null;
                try
                {
                    SongDB.Instance.UpdateSongDB();
                }
                catch (Exception ex)
                {
                    result = ex.Message;
                }
                JObject res = new JObject();
                res.Add("status", "success");
                if(result!=null)
                {
                    res["status"] = "failed";
                    res.Add("exception", result);
                }
                response.StatusCode = 200;
                httpRequestEventArgs.Response.WriteContent(Encoding.UTF8.GetBytes(res.ToString()));
            }
            else if (uri.AbsolutePath == "/song") // get song info with song id
            {
                if (!query.Contains("songid"))
                {
                    response.StatusCode = 200;
                    bytes = Encoding.UTF8.GetBytes("{\"status\":\"fail\",\"reason\":\"missing key songid\"}");
                    httpRequestEventArgs.Response.WriteContent(bytes);
                    return;
                }
                else
                {
                    song s = SongDB.Instance.GetSongbyId(query["songid"]);
                    if (s == null)
                    {
                        response.StatusCode = 200;
                        bytes = Encoding.UTF8.GetBytes("{\"status\":\"fail\",\"reason\":\"unknown songid\"}");
                        httpRequestEventArgs.Response.WriteContent(bytes);
                        return;
                    }
                    else
                    {
                        string post = SongDB.Instance.GetSongbyId(query["songid"]).ToString();
                        response.StatusCode = 200;
                        bytes = Encoding.UTF8.GetBytes(post);
                        httpRequestEventArgs.Response.WriteContent(bytes);
                        return;
                    }
                }
            }
            else if (uri.AbsolutePath == "/getalias") // get all alias of song
            {
                response.StatusCode = 200;
                bytes = Encoding.UTF8.GetBytes(JsonConvert.SerializeObject(alias2songid));
                httpRequestEventArgs.Response.WriteContent(bytes);
                return;
            }
            /*
            else if (uri.AbsolutePath == "/songranklist") // get ranklist of a specific song, disabled since there are too many users now
            {
                if (!query.Contains("songid") || !query.Contains("difficulty"))
                {
                    response.StatusCode = 200;
                    bytes = Encoding.UTF8.GetBytes("{\"status\":\"fail\",\"reason\":\"missing key songid or difficulty\"}");
                    httpRequestEventArgs.Response.WriteContent(bytes);
                    return;
                }
                if (SongDB.Instance.GetSongbyId(query["songid"]) == null)
                {
                    response.StatusCode = 200;
                    bytes = Encoding.UTF8.GetBytes("{\"status\":\"fail\",\"reason\":\"no such song:" + query["songid"] + "\"}");
                    httpRequestEventArgs.Response.WriteContent(bytes);
                    return;
                }
                HashSet<string> validdifficulty = new HashSet<string> { "0", "1", "2","3", "past", "present", "future","beyond" };
                if (!validdifficulty.Contains(query["difficulty"].ToLower()))
                {
                    response.StatusCode = 200;
                    bytes = Encoding.UTF8.GetBytes("{\"status\":\"fail\",\"reason\":\"invalid difficulty\"}");
                    httpRequestEventArgs.Response.WriteContent(bytes);
                    return;
                }
                string songid = query["songid"];
                Difficulty difficulty = Difficulty.past;
                if (query["difficulty"] == "1" || string.Equals(query["difficulty"], "present", StringComparison.OrdinalIgnoreCase))
                    difficulty = Difficulty.present;
                else if (query["difficulty"] == "2" || string.Equals(query["difficulty"], "future", StringComparison.OrdinalIgnoreCase))
                    difficulty = Difficulty.future;
                else if (query["difficulty"] == "3" || string.Equals(query["difficulty"], "beyond", StringComparison.OrdinalIgnoreCase))
                    difficulty = Difficulty.beyond;
                logger.Log(TraceEventType.Information, "Get the song ranklist of {0} in difficulty {1}", songid, difficulty.ToString());
                Dictionary<string, string> tg2id = loadobject<Dictionary<string, string>>("tg2id.json");
                JArray jArray = new JArray();
                List<Tuple<int, string, long>> list = new List<Tuple<int, string, long>>();
                int id = (int)Math.Ceiling(tg2id.Count / 10.0);
                HashSet<string> nameset = new HashSet<string>();
                for (int i = 0; i < id; ++i)
                {
                    string q = libarc.getfriendscore(query["songid"], difficulty, specialaccount[i].token);
                    JObject jo1 = JObject.Parse(q);
                    var friends = jo1["value"].Children().ToList();
                    foreach (var friend in friends)
                    {
                        string name = (string)friend["name"];
                        if (nameset.Contains(name))
                            continue;
                        nameset.Add(name);
                        list.Add(new Tuple<int, string, long>((int)friend["score"], name, (long)friend["time_played"]));
                        var user = userlist.GetUserbyArcaeaUsername(name);
                        if (user == null)
                        {
                            continue;
                        }
                    }
                }
                //saveobject("toprecord.txt", toprecord);
                list.Sort((x, y) => (y.Item1.CompareTo(x.Item1)));
                foreach (var i in list)
                {
                    jArray.Add(JObject.Parse("{" + $"\"name\":\"{i.Item2}\",\"score\":{i.Item1},\"rating\":{Calculateptt(i.Item1, songid, difficulty)},\"time_played\":{i.Item3}" + "}"));
                }
                bytes = Encoding.UTF8.GetBytes(jArray.ToString());
                httpRequestEventArgs.Response.WriteContent(bytes);
            }*/
            else if (uri.AbsolutePath == "/showfriend") // show friend of a temp account
            {
                Showfriend.go(logger, specialaccount, httpRequestEventArgs);
            }
            else if (uri.AbsolutePath == "/getuserscore") // get score of a specific song
            {
                string userid = query["userid"];
                string songid = query["songid"];
                Difficulty difficulty = Difficulty.past;
                if (query["difficulty"] == "1" || string.Equals(query["difficulty"], "present", StringComparison.OrdinalIgnoreCase))
                    difficulty = Difficulty.present;
                else if (query["difficulty"] == "2" || string.Equals(query["difficulty"], "future", StringComparison.OrdinalIgnoreCase))
                    difficulty = Difficulty.future;
                else if (query["difficulty"] == "3" || string.Equals(query["difficulty"], "beyond", StringComparison.OrdinalIgnoreCase))
                    difficulty = Difficulty.beyond;
                var score = GetScoreV2(userid, songid, difficulty);
                logger.Log(TraceEventType.Information, score);
                if (score != null)
                {
                    response.StatusCode = 200;
                    bytes = Encoding.UTF8.GetBytes(score);
                    httpRequestEventArgs.Response.WriteContent(bytes);
                }
                else
                {
                    response.StatusCode = 200;
                    bytes = Encoding.UTF8.GetBytes("noplay");
                    httpRequestEventArgs.Response.WriteContent(bytes);

                }
            }
            else if (uri.AbsolutePath == "/world") // get world ranklist of specific song
            {
                if (!query.Contains("songid") || !query.Contains("difficulty"))
                {
                    response.StatusCode = 200;
                    bytes = Encoding.UTF8.GetBytes("{\"status\":\"fail\",\"reason\":\"missing key songid or difficulty\"}");
                    httpRequestEventArgs.Response.WriteContent(bytes);
                    return;
                }
                if (SongDB.Instance.GetSongbyId(query["songid"]) == null)
                {
                    response.StatusCode = 200;
                    bytes = Encoding.UTF8.GetBytes("{\"status\":\"fail\",\"reason\":\"no such song:" + query["songid"] + "\"}");
                    httpRequestEventArgs.Response.WriteContent(bytes);
                    return;
                }
                HashSet<string> validdifficulty = new HashSet<string> { "0", "1", "2","3", "past", "present", "future","beyond" };
                if (!validdifficulty.Contains(query["difficulty"].ToLower()))
                {
                    response.StatusCode = 200;
                    bytes = Encoding.UTF8.GetBytes("{\"status\":\"fail\",\"reason\":\"invalid difficulty\"}");
                    httpRequestEventArgs.Response.WriteContent(bytes);
                    return;
                }
                string songid = query["songid"];
                Difficulty difficulty = Difficulty.past;
                if (query["difficulty"] == "1" || string.Equals(query["difficulty"], "present", StringComparison.OrdinalIgnoreCase))
                    difficulty = Difficulty.present;
                else if (query["difficulty"] == "2" || string.Equals(query["difficulty"], "future", StringComparison.OrdinalIgnoreCase))
                    difficulty = Difficulty.future;
                else if (query["difficulty"] == "3" || string.Equals(query["difficulty"], "beyond", StringComparison.OrdinalIgnoreCase))
                    difficulty = Difficulty.beyond;
                logger.Log(TraceEventType.Information, $"get the World top score of {songid} in difficulty {difficulty.ToString()}");
                Account xh = GetRandomAccount(out string userinfo);
                string json = libarc.getworldscore(songid, difficulty, xh.token);
                JObject jo = JObject.Parse(json);
                var scorelist = jo["value"].Children().ToList();
                JArray jArray = new JArray();
                foreach (var play in scorelist)
                {
                    string name = (string)play["name"];
                    int score = (int)play["score"];
                    jArray.Add(JObject.Parse("{" + $"\"name\":\"{name}\",\"score\":{score}" + "}"));
                }
                response.StatusCode = 200;
                bytes = Encoding.UTF8.GetBytes(jArray.ToString());
                httpRequestEventArgs.Response.WriteContent(bytes);
                return;
            }
            /*
            else if (uri.AbsolutePath == "/pttranklist") // get ranklist of ptt for all users, disable because there are too many users now
            {
                logger.Log(TraceEventType.Information, "get the PTT ranklist");
                JArray jArray = new JArray();
                Hashtable nameset = Hashtable.Synchronized(new Hashtable());
                ParallelOptions options = new ParallelOptions
                {
                    MaxDegreeOfParallelism = 20
                };
                Parallel.ForEach(specialaccount, options, x =>
                 {

                     string q = libarc.getuserinfo(x.token);
                     JObject jo1 = JObject.Parse(q);
                     var friends = jo1["value"]["friends"].Children().ToList();
                     List<string> friendlist = new List<string>();
                     foreach (var friend in friends)
                     {
                         string name = (string)friend["name"];
                         friendlist.Add(name);
                         if (name == "Tairitsu" || name == "Hikari")
                             continue;
                         if (nameset.ContainsKey(name))
                             continue;
                         int ptt = (int)friend["rating"];
                         if (ptt != -1)
                         {
                             double rating = ptt / 100.0;
                             nameset.Add(name, rating);
                         }
                     }
                     logger.Log(TraceEventType.Information, $"{(string)jo1["value"]["name"]}:{JArray.FromObject(friendlist).ToString(Formatting.None)}");
                 });
                List<Tuple<double, string>> result = new List<Tuple<double, string>>();
                foreach (var key in nameset.Keys)
                {
                    result.Add(new Tuple<double, string>((double)nameset[key], (string)key));
                }
                result.Sort((x, y) => (y.Item1.CompareTo(x.Item1)));
                foreach (var i in result)
                {
                    jArray.Add(JObject.Parse("{" + $"\"name\":\"{i.Item2}\",\"ptt\":{i.Item1}" + "}"));
                }
                response.StatusCode = 200;
                bytes = Encoding.UTF8.GetBytes(jArray.ToString());
                logger.Log(TraceEventType.Information, $"get ranklist of {result.Count} players!");
                pttranklistcache = jArray.ToString();
                saveobject("pttranklistcache.txt", pttranklistcache);
                httpRequestEventArgs.Response.WriteContent(bytes);
            }*/
            else if (uri.AbsolutePath == "/best30") // get best30 for 
            {
                string usercode = query["usercode"];
                long time1;
                if (query.Contains("time1"))
                    time1 = long.Parse(query["time1"]);
                IWork best30Work = new Best30()
                {
                    Usercode = usercode,
                };
                string res = best30Work.DoWork();
                JObject jo = JObject.Parse(res);
                if ((int)jo["status"] != 0)
                {
                    bytes = Encoding.UTF8.GetBytes("error");
                    httpRequestEventArgs.Response.WriteContent(bytes);
                }
                else
                {
                    var content = jo["content"];
                    double arc_30 = (double)content["best30_avg"];
                    double arc_recent = (double)content["recent10_avg"];
                    List<Songplay> play = new List<Songplay>();
                    var list = content["best30_list"].Children();
                    foreach (var song in list)
                    {
                        play.Add(new Songplay(song));
                    }
                    play.Sort((x, y) => y.rating.CompareTo(x.rating));
                    Best30data best30Data = new Best30data()
                    {
                        avg_recent = arc_recent,
                        avg_30 = arc_30,
                        best30 = play
                    };
                    if (Best30.ContainsKey(usercode))
                    {
                        Best30[usercode] = best30Data;
                    }
                    else
                    {
                        Best30.Add(usercode, best30Data);
                    }
                    //saveobject("Best30cache.json", Best30);
                    bytes = Encoding.UTF8.GetBytes(JsonConvert.SerializeObject(best30Data));
                    httpRequestEventArgs.Response.WriteContent(bytes);
                }
            }
            else if (uri.AbsolutePath == "/alias")
            {
                if (query.Contains("alias") == false && query.Contains("songid") == false)
                {
                    response.StatusCode = 200;
                    httpRequestEventArgs.Response.WriteContent(Encoding.UTF8.GetBytes("missing argument"));
                }
                else
                {
                    if (alias2songid.ContainsKey(query["alias"]))
                    {
                        response.StatusCode = 200;
                        httpRequestEventArgs.Response.WriteContent(Encoding.UTF8.GetBytes("alias exist!"));
                    }
                    else if (SongDB.Instance.GetSongbyId(query["songid"]) == null)
                    {
                        response.StatusCode = 200;
                        httpRequestEventArgs.Response.WriteContent(Encoding.UTF8.GetBytes("No such song!"));
                    }
                    else
                    {
                        alias2songid.Add(query["alias"], query["songid"]);
                        saveobject("alias.txt", alias2songid);
                        response.StatusCode = 200;
                        httpRequestEventArgs.Response.WriteContent(Encoding.UTF8.GetBytes("Done!"));
                    }

                }
            }
            else if (uri.AbsolutePath == "/delalias")
            {
                if (query.Contains("alias") == false)
                {
                    response.StatusCode = 200;
                    httpRequestEventArgs.Response.WriteContent(Encoding.UTF8.GetBytes("missing argument"));
                }
                else if (alias2songid.ContainsKey(query["alias"]) == false)
                {
                    response.StatusCode = 200;
                    httpRequestEventArgs.Response.WriteContent(Encoding.UTF8.GetBytes("No such alias!"));
                }
                else
                {
                    alias2songid.Remove(query["alias"]);
                    saveobject("alias.txt", alias2songid);
                    response.StatusCode = 200;
                    httpRequestEventArgs.Response.WriteContent(Encoding.UTF8.GetBytes("Done!"));
                }
            }
            else if (uri.AbsolutePath == "/tgid2uid")
            {
                string line = "";
                using (StreamReader sr = new StreamReader(File.Open("tg2id.json", FileMode.Open)))
                {
                    while (sr.EndOfStream == false)
                        line += sr.ReadLine();
                }
                response.StatusCode = 200;
                var bytes1 = Encoding.UTF8.GetBytes(line);
                httpRequestEventArgs.Response.WriteContent(bytes1);
            }
            else if (uri.AbsolutePath == "/adduser")
            {
                if (query.Contains("id") == false || query.Contains("tgid") == false)
                {
                    response.StatusCode = 200;
                    bytes = Encoding.UTF8.GetBytes("{\"status\":\"fail\",\"reason\":\"missing key id\"}");
                    httpRequestEventArgs.Response.WriteContent(bytes);
                }
                else
                {
                    string id = query["id"];
                    string tgid = query["tgid"];
                    logger.Log(TraceEventType.Information, "Add user arcaeaid:{0} with tgid:{1}", id, tgid);
                    Dictionary<string, string> tg2id = loadobject<Dictionary<string, string>>("tg2id.json");
                    bool flag = false;
                    foreach (var i in tg2id)
                    {
                        if (i.Value == id)
                            flag = true;
                    }
                    if (flag)
                    {
                        response.StatusCode = 200;
                        bytes = Encoding.UTF8.GetBytes("{\"status\":\"fail\",\"reason\":\"arcaea account exist!\"}");
                        httpRequestEventArgs.Response.WriteContent(bytes);
                        return;
                    }
                    tg2id.Add(tgid, id);
                    saveobject("tg2id.json", tg2id);
                    int count = tg2id.Count;
                    int specialid = count / 10;
                    string back = libarc.addfriend(id, specialaccount[specialid].token);
                    var recent = GetRecent(id);
                    JObject recentjson = JObject.Parse(recent);
                    var userid = (int)recentjson["user_id"];
                    string name = (string)recentjson["name"];
                    if (userlist.GetUserbyArcaeaid(id) == null)
                    {
                        userlist.Add(new User(tgid, id, userid.ToString(), "", name));
                        saveobject("userlist.json", userlist);
                    }
                    response.StatusCode = 200;
                    var bytes1 = Encoding.UTF8.GetBytes(recent);
                    httpRequestEventArgs.Response.WriteContent(bytes1);
                }
            }
            else if (uri.AbsolutePath == "/ping")
            {
                long timestamp1 = long.Parse(query["time1"]);
                long timestamp2 = long.Parse(query["time2"]);
                var now = TimeZoneInfo.ConvertTimeToUtc(DateTime.Now);
                var unitstart = new DateTime(1970, 1, 1);
                long timestamp3 = (long)(now - unitstart).TotalMilliseconds;
                Account xh = GetRandomAccount(out string userinfo);
                long timestamp4 = (long)(TimeZoneInfo.ConvertTimeToUtc(DateTime.Now) - unitstart).TotalMilliseconds;
                response.StatusCode = 200;
                JObject result = new JObject();
                result.Add("status", "success");
                result.Add("time1", timestamp1);
                result.Add("time2", timestamp2);
                result.Add("time3", timestamp3);
                result.Add("time4", timestamp4);
                var bytes1 = Encoding.UTF8.GetBytes(result.ToString());
                httpRequestEventArgs.Response.WriteContent(bytes1);
            }
            return;
        }

        public static void updateuserlist()
        {
            foreach (var id in loadobject<Dictionary<string, string>>("tg2id.json"))
            {
                var tgid = id.Key;
                if (tgid == "0")
                    continue;
                var arcaeauserid = id.Value;
                User user = userlist.GetUserbytgid(tgid);
                if (user == null)
                {
                    var recent = GetRecent(arcaeauserid);
                    var userid = ((int)JObject.Parse(recent)["user_id"]).ToString();
                    var arcaeausername = (string)JObject.Parse(recent)["name"];
                    userlist.Add(new User(id.Key, id.Value, userid, "", arcaeausername));
                    logger.Log(TraceEventType.Information, $"New user tgid={id.Key},arcaeausercode={id.Value},arcaeauserid={userid},arcaeaName={arcaeausername}");
                }
                else if (user.arcaeaid != arcaeauserid)
                {
                    User user1 = userlist.GetUserbytgid(id.Key);
                    userlist.Remove(user1);
                    var recent = GetRecent(arcaeauserid);
                    var userid = ((int)JObject.Parse(recent)["user_id"]).ToString();
                    var arcaeausername = (string)JObject.Parse(recent)["name"];
                    userlist.Add(new User(id.Key, id.Value, userid, "", arcaeausername));
                    logger.Log(TraceEventType.Information, $"New user tgid={id.Key},arcaeausercode={id.Value},arcaeauserid={userid},arcaeaName={arcaeausername}");
                }
            }
            saveobject("userlist.json", userlist);
        }

        public static Account GetRandomAccount(out string userinfo)
        {
            int len = accountlist.Count;
            Random rd = new Random();
            int index = rd.Next(0, len);

            Account xh = accountlist.ToList()[index].Value;
            try
            {
                userinfo = libarc.getuserinfo(xh.token);
            }
            catch (Exception)
            {
                xh.token = libarc.login(xh.username, xh.password, xh.guid);
                accountlist[xh.username].token = xh.token;
                userinfo = libarc.getuserinfo(xh.token);
                updatexiaohaolist();
            }
            return xh;
        }

        /// <summary>
        /// {"user_id":814803,"song_id":"dandelion","difficulty":2,"score":9832504,"shiny_perfect_count":800,"perfect_count":898,"near_count":15,"miss_count":8,"health":82,"modifier":2,"time_played":1560650921335,"best_clear_type":5,"clear_type":5,"name":"OriginCode","character":30,"is_skill_sealed":false,"is_char_uncapped":false}
        /// </summary>
        /// <param name="usercode"></param>
        /// <param name="songid"></param>
        /// <param name="difficulty"></param>
        private static string GetScore(string usercode, string songid, Difficulty difficulty)
        {
            Account rd = GetRandomAccount(out string userinfo);
            libarc.addfriend(usercode, rd.token);
            string json = libarc.getfriendscore(songid, difficulty, rd.token);
            var value = JObject.Parse(json)["value"];
            if (value.Children().Count() == 0)
            {
                return null;
            }
            //string arcaeauserid = userlist.GetUserbyArcaeaid(usercode).arcaeauserid;
            //libarc.delfriend(arcaeauserid, rd.token);
            libarc.delallfriend(rd.token);
            return value.Children().First().ToString();
        }

        private static string GetScoreV2(string usercode, string songid, Difficulty difficulty)
        {
            IWork userbest = new Userbest
            {
                Usercode = usercode,
                Songid = songid,
                Difficulty = (int)difficulty
            };
            string userbestResponse = userbest.DoWork();
            JObject userBestObject = JObject.Parse(userbestResponse);
            if ((int)userBestObject["status"] == -14)
                return null;
            IWork userinfo = new Recent
            {
                Usercode = usercode,
            };
            string userInfoResponse = userinfo.DoWork();
            Userbestdata result = JsonConvert.DeserializeObject<Userbestdata>(userBestObject["content"].ToString());
            JObject userinfoObject = JObject.Parse(userInfoResponse);
            Userinfodata userinfodata = JsonConvert.DeserializeObject<Userinfodata>(userinfoObject["content"].ToString());
            result.user_id = userinfodata.user_id;
            result.name = userinfodata.name;
            return JsonConvert.SerializeObject(result, Formatting.Indented);
        }

        private static string Compare(string usercode1, string usercode2, string songid, Difficulty difficulty)
        {
            throw new NotImplementedException();

        }

        /// <summary>
        /// {"user_id": 245379,"name": "xiaoxi654","recent_score": [{"song_id": "melodyoflove","difficulty": 2,"score": 8641893,"shiny_perfect_count": 648,"perfect_count": 749,"near_count": 111,"miss_count": 71,"clear_type": 0,"best_clear_type": 0,"health": 62,"time_played": 1566802629749,"modifier": 1,"rating": 6.739643333333333}],"character": 0,"join_date": 1511452751575,"rating": 922,"is_skill_sealed": false,"is_char_uncapped": false,"is_mutual": false}
        /// </summary>
        /// <param name="usercode"></param>
        /// <returns></returns>
        public static string GetRecent(string usercode)
        {
            try
            {
                Account rd = GetRandomAccount(out string userinfo);
                Console.WriteLine(rd.username);
                string json = "";
                {
                    json = libarc.addfriend(usercode, rd.token);
                    logger.Log(TraceEventType.Information, "addfriend: "+json);
                    JObject jo = JObject.Parse(json);
                    if ((string)jo["success"] == "failed")
                    {
                        return json;
                    }
                    User user = userlist.GetUserbyArcaeaid(usercode);
                    libarc.delallfriend(rd.token);
                    JToken result = null;
                    if (user == null)
                    {
                        return jo["value"]["friends"].Children().First().ToString();
                    }
                    else
                        return jo["value"]["friends"].Children().First(x => (string)x["user_id"] == user.arcaeauserid).ToString();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(JsonConvert.SerializeObject(ex));
                return "error";
            }
        }

        static bool gettopworking = false;

        // Get Top through estertion.win
        public static bool getTopFromRedive(string usercode)
        {
            if (gettopworking)
                return false;
            gettopworking = true;
            using (var ws = new WebSocket("wss://arc.estertion.win:616"))
            {
                ws.OnMessage += Ws_OnMessage;
                ws.Connect();
                ws.Send(usercode + " 1 12");
                while (ws.ReadyState != WebSocketState.Closed)
                {
                    System.Threading.Thread.Sleep(100);
                }
            }
            gettopworking = false;
            return true;
        }

        private static void Ws_OnMessage(object sender, MessageEventArgs e)
        {
            if (e.IsText)
            {
                logger.Log(TraceEventType.Information, "Receive message from redive: " + e.Data);
                if (e.Data == "bye")
                {
                    //ws.Close(CloseStatusCode.Normal);
                    return;
                }
                else if (e.Data == "queried")
                {

                }
            }
            else
            {
                var data = e.RawData;
                var output = new byte[40960];
                using (System.IO.MemoryStream msInput = new System.IO.MemoryStream(data))
                using (BrotliStream bs = new BrotliStream(msInput, System.IO.Compression.CompressionMode.Decompress))
                using (System.IO.MemoryStream msOutput = new System.IO.MemoryStream())
                {
                    bs.CopyTo(msOutput);
                    msOutput.Seek(0, System.IO.SeekOrigin.Begin);
                    output = msOutput.ToArray();
                }
                string receivejson = Encoding.UTF8.GetString(output);
                // using (StreamWriter sw = new StreamWriter(File.Open("jsonfile.txt",FileMode.Append)))
                //    sw.WriteLine(receivejson);
                JObject jo = JObject.Parse(receivejson);
                var cmd = (string)jo["cmd"];
                if (cmd == "userinfo")
                {

                }
                else if (cmd == "scores")
                {
                    var songplaylist = jo["data"].Children().ToList();
                    foreach (var sp in songplaylist)
                    {
                        Songplay play = new Songplay(sp);
                        int userid = (int)sp["user_id"];
                        var user = Util.GetUser(userlist, arcaeauserid: userid.ToString());
                        if (user == null)
                        {
                            Console.WriteLine(userid);
                            continue;
                        }
                    }
                }
            }
        }
    }
}
