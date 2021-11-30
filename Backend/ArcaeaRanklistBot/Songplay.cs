using System;
using System.Collections.Generic;
using System.Text;
using Newtonsoft.Json.Linq;

namespace ArcaeaRanklistBot
{
    public class Songplay
    {
        public string songid { get; set; }
        //public song Song { get; set; }
        public Difficulty difficulty { get; set; }
        public int score { get; set; }
        public int bigperfect { get; set; }
        public int perfect { get; set; }
        public int far { get; set; }
        public int lost { get; set; }
        public int health { get; set; }
        public ClearType cleartype { get; set; }
        public ClearType bestcleartype { get; set; }
        public long timestamp { get; set; }
        public double rating { get; set; }
        public double constant { get; set; }
        private string level(int score)
        {
            if (score >= 10000000)
                return "PM";
            else if (score >= 9800000)
                return "EX";
            else if (score >= 9500000)
                return "AA";
            else if (score >= 9200000)
                return "A";
            else if (score >= 8900000)
                return "B";
            else if (score >= 8600000)
                return "C";
            else return "D";
        }
        public static string timestamp2dt(long ts)
        {
            var dt = new DateTime(1970, 1, 1, 0, 0, 0).AddMilliseconds(ts);
            dt.AddHours(8);
            return dt.ToString("yyyy-MM-dd HH:mm:ss");
        }
        public string Show()
        {
            return $"Song: {SongDB.Instance.GetSongbyId(songid).en}\r\n" +
                $"Difficulty: {Enum.GetName(typeof(Difficulty), difficulty)}({constant})\r\n" +
                $"rating:{rating}\r\n" +
                $"Score: {score}({level(score)})({Enum.GetName(typeof(ClearType), cleartype)})\r\n" +
                $"Pure: {perfect}({bigperfect}) Far: {far} Lost:{lost} Recall: {health}\r\n" +
                $"Datetime: {timestamp2dt(timestamp)}\r\n";
        }
        public Songplay() { }
        public Songplay(JToken jt)
        {
            songid = (string)jt["song_id"];
            score = (int)jt["score"];
            perfect = (int)jt["perfect_count"];
            bigperfect = (int)jt["shiny_perfect_count"];
            far = (int)jt["near_count"];
            lost = (int)jt["miss_count"];
            cleartype = (ClearType)(int)jt["clear_type"];
            bestcleartype = (ClearType)(int)jt["best_clear_type"];
            health = (int)jt["health"];
            timestamp = (long)jt["time_played"];
            difficulty = (Difficulty)(int)jt["difficulty"];
            var song = SongDB.Instance.GetSongbyId(songid);
            if (difficulty == Difficulty.beyond && song.constant.Length < 4)
                constant = -1;
            else
                constant = song == null ? -1 : song.constant[(int)difficulty];
            if (jt["rating"] == null)
                rating = Program.Calculateptt(score, songid, difficulty);
            else
                rating = (double)jt["rating"];
        }
    }
}
