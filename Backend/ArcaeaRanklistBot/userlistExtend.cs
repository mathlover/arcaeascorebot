using System;
using System.Collections.Generic;
using System.Linq;

namespace ArcaeaRanklistBot
{
    public static class userlistExtend
    {
        public static User GetUserbytgid(this List<User>userlist, string tgid)
        {
            var users = userlist.Where(x => x.tgid == tgid);
            if (users.Count() == 0)
                return null;
            else return users.First();
        }

        public static User GetUserbyArcaeaUserid(this List<User>userlist, string ArcaeaUserid)
        {
            var users = userlist.Where(x => x.arcaeauserid == ArcaeaUserid);
            if (users.Count() == 0)
                return null;
            else return users.First();
        }

        public static User GetUserbyArcaeaUsername(this List<User>userlist, string username)
        {
            var users = userlist.Where(x => x.arcaeausername == username);
            if (users.Count() == 0)
                return null;
            else return users.First();
        }

        public static User GetUserbyArcaeaid(this List<User> userlist, string arcaeaid)
        {
            var users = userlist.Where(x => x.arcaeaid == arcaeaid);
            if (users.Count() == 0)
                return null;
            else return users.First();
        }
    }
}
