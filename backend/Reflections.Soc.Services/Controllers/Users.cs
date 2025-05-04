using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Net.Mail;
using System.Web;
using System.IO;
using System.Net;
using System.Text;
using System.Text.RegularExpressions;
using System.Reflection;
using System.Configuration;
using System.Security.Cryptography;
using Newtonsoft.Json.Linq;
using Reflections.SolutionsPlus.Services;
using Reflections.SolutionsPlus.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.DependencyInjection;
using MongoDB.Bson;

namespace Reflections.SolutionsPlus.Services.Controllers
{
	[ApiController]
    [Route("[controller]")]
    public class Users : Controller
    {
		private readonly AppSettings _mySettings;
		private readonly IOptions<AppSettings> conf; 
		UserService _users;

        [ActivatorUtilitiesConstructorAttribute]
        public Users(IOptions<AppSettings> appConf)
        {
            conf = appConf;
            _mySettings = appConf.Value;
            _users = new UserService(appConf);
        }

        public Users(AppSettings appSetting)
        {
            _mySettings = appSetting;

            _users = new UserService(appSetting);
        }

        [EnableCors("MyPolicy")]
        [HttpPost("CreateUser")]
        public IActionResult CreateUser(Models.Users input)
        {
            var jo = JObject.Parse(Newtonsoft.Json.JsonConvert.SerializeObject(input));
            var email = jo["Email"].ToString().ToLower();
            var password = jo["Password"].ToString().ToLower();

            var user = new Models.Users();
            UserService _userservice = new UserService(conf);
            user.Email = email;
            user.Password = password;

            _userservice.Create(user);
            return StatusCode(200, "User Created");
        }


        [EnableCors("MyPolicy")]
        [HttpPost("ValidateUser")]
        public IActionResult ValidateUser (Dictionary<string, string> input)
        {
            var jo = JObject.Parse(Newtonsoft.Json.JsonConvert.SerializeObject(input));
            var email = input["Email"];
            var password = input["Password"];
            UserService _userservice = new UserService(conf);
            Models.Users user = _userservice.Get(email, password);
            return StatusCode(200, user);
        }

        [EnableCors("MyPolicy")]
        [HttpGet("GetAllUsers")]
        public IActionResult GetAllUsers()
        {
            UserService _userservice = new UserService(conf);
            List<Models.Users> oObj = _userservice.GetAll();
            return StatusCode(200, oObj);
        }

    }
}
