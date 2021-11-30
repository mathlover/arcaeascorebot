using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;

namespace ArcaeaRanklistBot.Methods
{
    // Get recent play score using BotArcAPI
    public class Recent : IWork
    {
        public string Usercode { get; set; }

        public string DoWork()
        {
            if (string.IsNullOrWhiteSpace(Usercode))
            {
                throw new InvalidOperationException($"Invalid Usercode: {Usercode}");
            }

            HttpClient httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Add("Method", "GET");
            var response = httpClient.GetAsync(string.Format(Constants.V2Url + "/v4/user/info?usercode={0}&recent=true", this.Usercode));
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
