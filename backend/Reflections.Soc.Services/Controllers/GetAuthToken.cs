using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json.Converters;
using System.Text.Json;
using System.Text;
using System.Net;
using System.IO;
using Reflections.Mailer.Services;
using Reflections.Mailer.Services.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;

namespace Reflections.Mailer.Services.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class GetAuthToken : Controller
    {
        string googleAppClientID = string.Empty;
        string googleAppRedirectUrl = string.Empty;
        string gmailAuthScope = string.Empty;
        string googleAppClientSecretKey = string.Empty;
        private readonly AppSettings _mySettings;

        private readonly IOptions<AppSettings> conf;
        public GetAuthToken(IOptions<AppSettings> appConf)
        {
            conf = appConf;
            _mySettings = appConf.Value;
            googleAppClientID = _mySettings.googleAppClientID;
            googleAppRedirectUrl = _mySettings.googleAppRedirectUrl;
            gmailAuthScope = _mySettings.gmailAuthScope;
            googleAppClientSecretKey = _mySettings.googleAppClientSecretKey;
        }
        [EnableCors("MyPolicy")]
        [HttpGet("GetAuthURL")]
        public IActionResult GetAuthURL()
        {
            string state = new Guid().ToString();
            string redirectUrl = string.Format("https://accounts.google.com/o/oauth2/auth?response_type=code&client_id={0}&redirect_uri={1}&state={2}&access_type={3}&approval_prompt={4}&scope={5}", googleAppClientID, Uri.EscapeDataString(googleAppRedirectUrl), state, "offline", "force", Uri.EscapeUriString(gmailAuthScope));
            return StatusCode(200, redirectUrl);
        }

        [EnableCors("MyPolicy")]
        [HttpPost("GetAuthTokenFromCode")]
        public IActionResult GetAuthTokenFromCode([FromForm] string code)
        {
            Accounts ac = null;
            try
            {
                StringBuilder body = new StringBuilder();
                body.Append("code=" + code + "&");
                body.Append("client_id=" + googleAppClientID + "&");
                body.Append("client_secret=" + googleAppClientSecretKey + "&");
                body.Append("redirect_uri=" + Uri.EscapeDataString(googleAppRedirectUrl) + "&");
                body.Append("grant_type=authorization_code&");
                WebRequest req = WebRequest.Create(string.Format("https://www.googleapis.com/oauth2/v3/token?code={0}&client_id={1}&client_secret={2}&redirect_uri={3}&grant_type={4}", new object[]
                {
                    code,
                    googleAppClientID,
                    googleAppClientSecretKey,
                    googleAppRedirectUrl,
                    "authorization_code"
                }));
                req.ContentType = "application/x-www-form-urlencoded";
                req.Method = "POST";
                byte[] data = Encoding.ASCII.GetBytes(body.ToString());
                req.ContentLength = (long)data.Length;
                Stream os = req.GetRequestStream();
                os.Write(data, 0, data.Length);
                os.Close();
                WebResponse resp = req.GetResponse();
                if (resp != null)
                {
                    StreamReader sr = new StreamReader(resp.GetResponseStream());
                    string strResult = sr.ReadToEnd().Trim();
                    resp.Close();
                    sr.Close();
                    JObject jo1 = JObject.Parse(strResult);
                    string access_token = jo1["access_token"].ToString();
                    string refresh_token = jo1["refresh_token"].ToString();
                    string emailAddress = string.Empty;

                    //Got the token, now get the User Email details
                    var apiUrl = string.Format("https://www.googleapis.com/gmail/v1/users/me/profile?key={0}", access_token);
                    req = WebRequest.Create(apiUrl);
                    req.Method = "GET";
                    req.Headers.Add("Authorization: Bearer " + access_token);
                    resp = req.GetResponse();

                    var userEmailAddress = string.Empty;

                    if (resp != null)
                    {
                        sr = new StreamReader(resp.GetResponseStream());
                        strResult = sr.ReadToEnd().Trim();
                        resp.Close();
                        sr.Close();
                        JObject joProfileDetails = JObject.Parse(strResult);
                        userEmailAddress = joProfileDetails["emailAddress"].ToString();
                    }
                    AccountService _accountservice = new AccountService(conf);
                    ac = _accountservice.Get(userEmailAddress);
                    var isNew = ac == null;
                    if (isNew)
                        ac = new Accounts();
                    ac.Email = userEmailAddress;
                    ac.Token = access_token;
                    ac.RefreshToken = refresh_token;
                    ac.DateUpdated = DateTime.UtcNow;
                    if(isNew)
                        _accountservice.Create(ac);
                    else
                        _accountservice.Update(ac.Id, ac);
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
            if (ac != null)
                return StatusCode(200, ac.Id);
            else
                return StatusCode(400, "We encountered issues while obtaining your Authorization from Google, please try again. If this problem persist, please contact the admin.");
        }
    }
}
