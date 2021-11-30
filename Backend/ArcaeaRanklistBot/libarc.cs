using System;
using System.Collections.Generic;
using System.Text;
using System.Net;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;
using System.IO;
using System.Linq;
using Newtonsoft.Json.Converters;
using System.Diagnostics;

namespace ArcaeaRanklistBot
{
    [JsonConverter(typeof(StringEnumConverter))]
    public enum Difficulty { past, present, future, beyond };
    public enum ClearType { TrackLost, NormalClear, FullRecall, PureMemory, EasyClear, HardClear };
    public enum Package { Arcaea, AdversePrelude, LuminousSky, ViciousLabyrinth, EternalCore, AbsoluteReason, BinaryEnfold, AmbivalentVision, CrimsonSolace, CHUNITHM, GrooveCoaster, ToneSphere, Lanota, Stellights, Dynamix, MemoryArchive };


    public class song
    {
        public string id, en, ja;
        public int[] rating;
        public double[] constant;
        public string artist;
        public string bpmrange;
        public Package package;
        public song() { rating = new int[4]; constant = new double[4]; }
        public song(string id1, string en1 = "", string ja1 = "", double pst = 0, double prs = 0, double ftr = 0, double byd = 0)
        {
            id = id1;
            en = en1;
            ja = ja1;
            constant = new double[4] { pst, prs, ftr, byd};
        }

        public override string ToString()
        {
            string ftrrating = rating[2].ToString();
            if (rating[2] == 10)
                ftrrating = "9+";
            else if (rating[2] == 11)
                ftrrating = "10";
            return $"Songid: {id}\r\n" +
                $"Song: {en}" + ((ja !=null ) ? $"({ja})" : "") + "\r\n" +
                $"Artist: {artist}\r\n" +
                $"Rating: {rating[0]}/{rating[1]}/{ftrrating}\r\n" +
                $"Constant: {constant[0]}/{constant[1]}/{constant[2]}\r\n" +
                $"Package: {package.ToString()}";
        }
    }
    public class friend
    {
        public Songplay recent { get; set; }
        public bool mutual { get; set; }
        public double ptt { get; set; }
        public long joindate { get; set; }
        public string name { get; set; }
        public int userid { get; set; }
        public int friendid { get; set; }
    }
    
    internal class AppConfig
    {
        public string AppVersion { get; set; }
        public int API_VER { get; set; }
    }
    public static class libarc
    {
        private static AppConfig config = null;
        internal static AppConfig Config
        {
            get
            {
                if(config == null)
                {
                    config = Loadconfig();
                }
                return config;
            }
        }
        public static string static_uuid = "";
        public static string URL => "https://arcapi.lowiro.com/latte/" + Config.API_VER;
        public static Dictionary<Package, List<song>> album = new Dictionary<Package, List<song>>();
        public static ILogger logger;

        /// <returns>{"success":true,"value":[{"user_id":814803,"song_id":"dandelion","difficulty":2,"score":9832504,"shiny_perfect_count":800,"perfect_count":898,"near_count":15,"miss_count":8,"health":82,"modifier":2,"time_played":1560650921335,"best_clear_type":5,"clear_type":5,"name":"OriginCode","character":30,"is_skill_sealed":false,"is_char_uncapped":false}]}</returns>
        public static string getfriendscore(string songid, Difficulty difficulty, string token)
        {
            Stopwatch stopwatch = new Stopwatch();
            stopwatch.Start();
            Dictionary<string, string> header = new Dictionary<string, string>();
            header.Add("Authorization", "Bearer " + token);
            string json = Util.HttpGet(URL+"/score/song/friend", $"song_id={songid}&difficulty={(int)difficulty}",header);
            JObject jo = JObject.Parse(json);
            stopwatch.Stop();
            logger.Log(TraceEventType.Verbose, $"Get Friend Score for {songid} and {difficulty.ToString()} in {stopwatch.ElapsedMilliseconds / 1000} sec");
            if ((bool)jo["success"])
            {
                return json;
            }
            else
            {
                return "error";
            }
        }
        /// <summary>
        /// {"success":true,"value":[{"user_id":869275,"song_id":"heavenlycaress","difficulty":2,"score":10001560,"shiny_perfect_count":1560,"perfect_count":1560,"near_count":0,"miss_count":0,"health":100,"modifier":0,"time_played":1572093205727,"best_clear_type":3,"clear_type":3,"name":"FUTABASAKI","character":12,"is_skill_sealed":false,"is_char_uncapped":false},{"user_id":10927,"song_id":"heavenlycaress","difficulty":2,"score":10001560,"shiny_perfect_count":1560,"perfect_count":1560,"near_count":0,"miss_count":0,"health":100,"modifier":0,"time_played":1572069807284,"best_clear_type":3,"clear_type":3,"name":"TAKUAN","character":23,"is_skill_sealed":false,"is_char_uncapped":false}]}
        /// </summary>
        public static string getworldscore(string songid,Difficulty difficulty,string token,int limit=10)
        {
            Dictionary<string, string> header = new Dictionary<string, string>();
            header.Add("Authorization", "Bearer " + token);
            string json = Util.HttpGet(URL + "/score/song", $"song_id={songid}&difficulty={(int)difficulty}&start=0&limit={limit}", header);
            JObject jo = JObject.Parse(json);
            if ((bool)jo["success"] == true)
            {
                return json;
            }
            else
            {
                return "error";
            }
        }
        public static string delfriend(string frienduid, string token)
        {
            Stopwatch stopwatch = new Stopwatch();
            stopwatch.Start();
            Dictionary<string, string> header = new Dictionary<string, string>();
            header.Add("Authorization", "Bearer " + token);
            string json = Util.HttpPost(URL + "/friend/me/delete", $"friend_id={frienduid}", header);
            JObject jo = JObject.Parse(json);
            stopwatch.Stop();
            logger.Log(TraceEventType.Verbose, $"Remove {frienduid} in {stopwatch.ElapsedMilliseconds / 1000.0} sec");
            if ((bool)jo["success"] == true)
            {
                return json;
            }
            else
            {
                return "error";
            }
        }

        public static void delallfriend(string token)
        {
            Stopwatch stopwatch = new Stopwatch();
            stopwatch.Start();
            var userinfo = getuserinfo(token);
            //Console.WriteLine(userinfo);
            JObject jo = JObject.Parse(userinfo);
            var friends = jo["value"]["friends"].Children().ToList();
            string res = "";
            foreach (var friend in friends)
            {
                if ((string)friend["name"] == "Tairitsu" || (string)friend["name"] == "Hikari")
                    continue;
                if (delfriend(((int)friend["user_id"]).ToString(), token) != "error")
                    Console.WriteLine("remove friend " + (string)friend["name"] + " from " + (string)jo["value"]["name"]);
            }
            stopwatch.Stop();
            logger.Log(TraceEventType.Verbose, $"Remove {friends.Count} friends in {stopwatch.ElapsedMilliseconds / 1000.0} sec");
        }
        public static string addfriend(string frienduid, string token)
        {
            Stopwatch stopwatch = new Stopwatch();
            stopwatch.Start();
            Dictionary<string, string> header = new Dictionary<string, string>();
            header.Add("Authorization", "Bearer " + token);
            try
            {
                string json = Util.HttpPost(URL + "/friend/me/add", $"friend_code={frienduid}", header);
                JObject jo = JObject.Parse(json);
                //Console.WriteLine(json);
                if ((bool)jo["success"] == true)
                {
                    return json;
                }
                else if((int)jo["error_code"]==5)
                {
                    return "{\"success\":\"fail\",\"reason\":\"API_VER too low\"}"; 
                }
                else
                {
                    return "{\"success\":\"fail\",\"reason\":\"unknown\"}";
                }
            }catch(WebException ex)
            {
                HttpWebResponse response = (HttpWebResponse)ex.Response;
                if (response.StatusCode == HttpStatusCode.NotFound)
                    return "{\"success\":\"fail\",\"reason\":\"No such player\"}";
                else if(response.StatusCode==HttpStatusCode.Forbidden)
                    return "{\"success\":\"fail\",\"reason\":\"already friend\"}";
                else return "{\"success\":\"fail\",\"reason\":\"unknown\"}";
            }
            finally
            {
                stopwatch.Stop();
                logger.Log(TraceEventType.Verbose, $"Add friend {frienduid} in {stopwatch.ElapsedMilliseconds / 1000.0} sec");
            }
        }

        public static string showfriends(string token)
        {
            var userinfo = getuserinfo(token);
            if (userinfo == "error")
                return "error";
            JObject jo = JObject.Parse(userinfo);
            var friends = jo["value"]["friends"].Children().ToList();
            string res = "";
            foreach(var friend in friends)
            {
                string name = (string)friend["name"];
                int userid = (int)friend["user_id"];
                res += name + "/";
            }
            return res;
        }
        public static string register(string name, string password, string email,string outputfile,bool add_auth = true, string platform = "ios", bool change_device_id = true)
        {
            string device_id = "";
            string static_uuid1=static_uuid;
            if (change_device_id)
            {
                device_id = Guid.NewGuid().ToString().ToUpper();
                static_uuid1 = device_id;
            }
            string register_data = $"name={name}&password={password}&email={email.Replace("@", "%40")}&device_id={device_id}&platform={platform}";
            string json = Util.HttpPost(URL + "/user/", register_data);
            JObject jo = JObject.Parse(json);
            if ((bool)jo["success"] == true)
            {
                using (StreamWriter sw = new StreamWriter(File.Open(outputfile, FileMode.Append, FileAccess.Write,FileShare.Write)))
                {
                    sw.WriteLine($"{name}|{password}|{static_uuid1}|{(string)jo["value"]["access_token"]}");
                }
                Console.WriteLine(json);
                return (string)jo["value"]["access_token"];
            }
            else
            {
                return "error";
            }
        }
        public static string getuserinfo(string token)
        {
            Dictionary<string, string> header = new Dictionary<string, string>();
            header.Add("Authorization", "Bearer " + token);
            string json = Util.HttpGet(URL + "/user/me", "", header);
            JObject jo = JObject.Parse(json);
            if ((bool)jo["success"] == true)
            {
                return json;
            }
            else
            {
                return "error";
            }
        }

        // For test only
        public static string testapi(string api, string param, string token)
        {
            Dictionary<string, string> header = new Dictionary<string, string>();
            header.Add("Authorization", "Bearer " + token);
            string json = Util.HttpGet(URL + api, param, header);
            JObject jo = JObject.Parse(json);
            if ((bool)jo["success"] == true)
            {
                return json;
            }
            else
            {
                return "error";
            }
        }

        public static string login(string name, string password, string uuid)
        {
            Stopwatch stopwatch = new Stopwatch();
            stopwatch.Start();
            Dictionary<string, string> header = new Dictionary<string, string>();
            header.Add("DeviceId", uuid);
            header.Add("Authorization", $"Basic {Convert.ToBase64String(Encoding.UTF8.GetBytes($"{name}:{password}"))}");
            string json = Util.HttpPost(URL + "/auth/login", "grant_type=client_credentials", header);
            JObject jo = JObject.Parse(json);
            stopwatch.Stop();
            logger.Log(TraceEventType.Verbose, $"Login {name} in {stopwatch.ElapsedMilliseconds / 1000} sec");
            if ((bool)jo["success"] == true)
            {
                var token = (string)jo["access_token"];
                Console.WriteLine($"login successfully: {token}");
                return token;
            }
            else
            {
                return "error";
            }
        }

        private static AppConfig Loadconfig()
        {
            AppConfig config = new AppConfig();
            Dictionary<string, string> dict = new Dictionary<string, string>();
            using (StreamReader sr = new StreamReader(File.Open("config.txt", FileMode.Open)))
            {
                while (sr.EndOfStream == false)
                {
                    string line = sr.ReadLine();
                    if (line.StartsWith('#'))
                        continue;
                    string[] split = line.Split('=');
                    var key = split[0].Trim();
                    var value = split[1].Trim();
                    dict.Add(key, value);
                }
            }
            if (dict.ContainsKey("AppVersion"))
                config.AppVersion = dict["AppVersion"];
            if (dict.ContainsKey("API_VER"))
                config.API_VER = int.Parse(dict["API_VER"]);
            return config;
        }
    }
}
