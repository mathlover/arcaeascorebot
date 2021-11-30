using System;
using System.Collections.Generic;
using System.Text;
using System.IO;
using Newtonsoft.Json;

namespace ArcaeaRanklistBot
{
    public class SongDB
    {
        private SongDB(string filename = "songdb.json")
        {
            using (StreamReader sr = new StreamReader(File.Open(filename, FileMode.Open)))
            {
                string json = sr.ReadToEnd();
                songlist = JsonConvert.DeserializeObject<Dictionary<string, song>>(json);
            }
        }
        private static readonly Lazy<SongDB> lazy = new Lazy<SongDB>(() => new SongDB());
        public static Dictionary<string, song> songlist = null;
        public static Dictionary<Package, List<song>> album = new Dictionary<Package, List<song>>();
        public static SongDB Instance
        {
            get
            {
                return lazy.Value;
            }
        }
        public string Getsongdbjson()
        {
            return JsonConvert.SerializeObject(songlist);
        }

        public void UpdateSongDB(string filename = "songdb.json")
        {
            using (StreamReader sr = new StreamReader(File.Open(filename, FileMode.Open)))
            {
                string json = sr.ReadToEnd();
                songlist = JsonConvert.DeserializeObject<Dictionary<string, song>>(json);
            }
        }

        public void WriteDBtoFile(string filename = "songdb.json")
        {
            using (StreamWriter sr = new StreamWriter(File.Open(filename, FileMode.Create)))
            {
                sr.WriteLine(JsonConvert.SerializeObject(songlist, Formatting.Indented));
            }
        }

        public song GetSongbyId(string songid)
        {
            if (songlist.ContainsKey(songid))
                return songlist[songid];
            else return null;
        }
        public List<Tuple<string, Difficulty>> GetSongs(double minptt, double maxptt, HashSet<Package> packages = null)
        {
            if (maxptt == -1) maxptt = 12;
            if (minptt == -1) minptt = 1;
            List<Tuple<string, Difficulty>> result = new List<Tuple<string, Difficulty>>();
            foreach (var i in songlist)
            {
                for (int diff = 0; diff < 3; ++diff)
                    if (minptt <= i.Value.constant[diff] && i.Value.constant[diff] <= maxptt)
                    {
                        if (packages == null || packages.Contains(i.Value.package))
                        {
                            result.Add(new Tuple<string, Difficulty>(i.Value.id, (Difficulty)diff));
                        }

                    }
            }
            return result;
        }
        public void Insert(song s)
        {
            songlist.Add(s.id, s);
            if (album.ContainsKey(s.package))
                album[s.package].Add(s);
            else album.Add(s.package, new List<song> { s });
        }
    }
}
