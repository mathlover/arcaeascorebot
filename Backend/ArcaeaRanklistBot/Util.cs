using System;
using System.Collections.Generic;
using System.Text;
using System.Net;
using System.IO;
using ICSharpCode.SharpZipLib.GZip;

namespace ArcaeaRanklistBot
{
    public static class Util
    {
        public static string HttpPost(string url, string postDataStr, Dictionary<string, string> extraheader = null)
        {
            byte[] bytearray2 = Encoding.ASCII.GetBytes(postDataStr);
            HttpWebRequest request = (HttpWebRequest)WebRequest.Create(url);
            request.Method = "POST";
            request.Headers.Add("Accept-Language", "en-us");
            request.Accept = "*/*";
            request.Host = "arcapi.lowiro.com";
            if (extraheader != null)
            {
                foreach (var i in extraheader)
                    request.Headers.Add(i.Key, i.Value);
            }
            request.ContentType = "application/x-www-form-urlencoded; charset=utf-8";
            request.Headers.Add("Accept-Encoding", "gzip, deflate");
            request.Headers.Add("AppVersion", libarc.Config.AppVersion);
            request.UserAgent = "Arc-mobile/2.6.0.0 CFNetwork/758.3.15 Darwin/15.4.0";
            request.ContentLength = bytearray2.Length;
            Stream myRequestStream = request.GetRequestStream();
            myRequestStream.Write(bytearray2, 0, bytearray2.Length);
            myRequestStream.Close();
            HttpWebResponse response = (HttpWebResponse)request.GetResponse();
            Stream myResponseStream = response.GetResponseStream();
            StreamReader myStreamReader = new StreamReader(myResponseStream, Encoding.Default);
            MemoryStream mem = new MemoryStream();
            myStreamReader.BaseStream.CopyTo(mem);
            byte[] base64 = mem.ToArray();
            mem.Close();
            myStreamReader.Close();
            myResponseStream.Close();
            string res;
            if (base64[0] == 0x1f && base64[1] == 0x8b)
                res = UnGzipFile(base64);
            else res = Encoding.UTF8.GetString(base64);
            return res;
        }

        public static string HttpGet(string url, string dataStr, Dictionary<string, string> extraheader = null)
        {
            HttpWebRequest request = (HttpWebRequest)WebRequest.Create(url + "?" + dataStr);
            request.Method = "GET";
            request.Headers.Add("Accept-Language", "en-us");
            request.Accept = "*/*";
            request.Host = "arcapi.lowiro.com";
            if (extraheader != null)
            {
                foreach (var i in extraheader)
                    request.Headers.Add(i.Key, i.Value);
            }
            request.ContentType = "application/x-www-form-urlencoded; charset=utf-8";
            request.Headers.Add("Accept-Encoding", "gzip, deflate");
            request.Headers.Add("AppVersion", libarc.Config.AppVersion);
            request.UserAgent = "Arc-mobile/2.5.2.0 CFNetwork/758.3.15 Darwin/15.4.0";
            HttpWebResponse response = (HttpWebResponse)request.GetResponse();
            Stream myResponseStream = response.GetResponseStream();
            StreamReader myStreamReader = new StreamReader(myResponseStream, Encoding.Default);
            MemoryStream mem = new MemoryStream();
            myStreamReader.BaseStream.CopyTo(mem);
            byte[] base64 = mem.ToArray();
            mem.Close();
            myStreamReader.Close();
            myResponseStream.Close();
            string res;
            if (base64[0] == 0x1f && base64[1] == 0x8b)
                res = UnGzipFile(base64);
            else res = Encoding.UTF8.GetString(base64);
            return res;
        }
        public static string UnGzipFile(byte[] str)
        {
            List<byte> output = new List<byte>();
            using (GZipInputStream zipFile = new GZipInputStream(new MemoryStream(str)))
            {
                {
                    int buffersize = 2048;
                    while (buffersize > 0)
                    {
                        byte[] FileData = new byte[buffersize];
                        buffersize = zipFile.Read(FileData, 0, buffersize);
                        Array.Resize(ref FileData, buffersize);
                        output.AddRange(FileData);
                    }
                }
            }
            return Encoding.UTF8.GetString(output.ToArray());
        }

        public static User GetUser(List<User> userlist, string tgid = "", string arcaeaid = "", string arcaeauserid = "", string arcaeausername = "")
        {
            if (tgid != "")
                return userlist.Find(x => x.tgid == tgid);
            else if(arcaeaid!="")
                return userlist.Find(x => x.arcaeaid == arcaeaid);
            else if(arcaeauserid!="")
                return userlist.Find(x => x.arcaeauserid == arcaeauserid);
            else if(arcaeausername!="")
                return userlist.Find(x => x.arcaeausername == arcaeausername);
            return null;
        }
    }
}
