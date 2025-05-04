using Reflections.SolutionsPlus.Models;
using MongoDB.Driver;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.DependencyInjection;
using MongoDB.Bson;


namespace Reflections.SolutionsPlus.Services
{
    public class UserService
    {
        private readonly IMongoCollection<Users> _users;
        private readonly AppSettings _mySettings;

        public UserService(IOptions<AppSettings> appConf)
        {
            _mySettings = appConf.Value;
            var client = new MongoClient(_mySettings.ConnectionString);
            var database = client.GetDatabase(_mySettings.DatabaseName);
            _users = database.GetCollection<Users>("users");
        }

        public UserService(AppSettings appSettings)
        {
            _mySettings = appSettings;
            var client = new MongoClient(_mySettings.ConnectionString);
            var database = client.GetDatabase(_mySettings.DatabaseName);
            _users = database.GetCollection<Users>("users");
        }

        public Users Create(Users user)
        {
            user.DateCreated = System.DateTime.UtcNow;
            user.DateUpdated = System.DateTime.UtcNow;
            user.ObjectId = user.Id.ToString();
            _users.InsertOne(user);
            return user;
        }

        public Users Get(string username, string password) =>
            _users.Find(u => u.UserName == username && u.Password == password).FirstOrDefault();

        public Users Get(ObjectId oId) =>
            _users.Find(u => u.Id == oId & u.Status == RecordStatus.Active).Single();

        public List<Users> GetAll() =>
            _users.Find(d => d.Status == RecordStatus.Active).ToList();
    }
}
