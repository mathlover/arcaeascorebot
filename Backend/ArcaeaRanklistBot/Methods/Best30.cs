using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using Newtonsoft.Json.Linq;

namespace ArcaeaRanklistBot.Methods
{
    // get user best30 data using bot arc api
    public class Best30: IWork
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
            var response = httpClient.GetAsync(string.Format(Constants.V2Url + "/v4/user/best30?usercode={0}", this.Usercode));
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
