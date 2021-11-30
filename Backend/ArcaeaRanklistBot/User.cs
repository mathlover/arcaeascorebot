using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ArcaeaRanklistBot
{
    public class User
    {
        public string tgid;
        public string arcaeaid;
        public string arcaeauserid;
        public string tgusername;
        public string arcaeausername;
        public int killnum;
        /// <summary>
        /// New user
        /// </summary>
        /// <param name="s1">telegram id</param>
        /// <param name="s2">arcaea friend id</param>
        /// <param name="s3">arcaea internal id</param>
        /// <param name="s4">telegram username</param>
        /// <param name="s5">arcaea username</param>
        public User(string s1,string s2,string s3,string s4,string s5)
        {
            tgid = s1;
            arcaeaid = s2;
            arcaeauserid = s3;
            tgusername = s4;
            arcaeausername = s5;
        }

        public override string ToString()
        {
            JObject userobject = JObject.FromObject(this);
            return userobject.ToString();
        }
    }
}

