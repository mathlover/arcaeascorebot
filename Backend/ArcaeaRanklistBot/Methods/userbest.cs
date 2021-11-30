using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using Newtonsoft.Json.Linq;

namespace ArcaeaRanklistBot.Methods
{
    // Get best play score using BotArcAPI
    internal class Userbest : IWork
    {
        public string Usercode { get; set; }

        public string Songid { get; set; }

        public int Difficulty { get; set; }

        public string DoWork()
        {
            HttpClient httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Add("Method", "GET");
            var response = httpClient.GetAsync(string.Format(Constants.V2Url + "/v4/user/best?usercode={0}&songname={1}&difficulty={2}", this.Usercode, this.Songid, this.Difficulty));
            response.Wait();
            var statuscode = response.Result.StatusCode;
            var tokenRes = response.Result.Content.ReadAsStringAsync();
            tokenRes.Wait();
            var token = JObject.Parse(tokenRes.Result);
            string result = token.ToString(Newtonsoft.Json.Formatting.Indented);
            return result;
        }
    }
}
