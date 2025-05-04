using Reflections.Mailer.Services.Models;
using MongoDB.Driver;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using Microsoft.Extensions.DependencyInjection;

namespace Reflections.Mailer.Services
{
    public class AccountService
    {
        private readonly IMongoCollection<Accounts> _accountconfigs;
        private readonly AppSettings _mySettings;

        //public AccountService()
        //{
        //    var client = new MongoClient("mongodb://localhost:27017");
        //    var database = client.GetDatabase("GmailEmail");
        //    _accountconfigs = database.GetCollection<AccountConfigs>("accountconfigs");
        //}

        [ActivatorUtilitiesConstructorAttribute]
        public AccountService(IOptions<AppSettings> appConf)
        {
            _mySettings = appConf.Value;
            var client = new MongoClient(_mySettings.ConnectionString);
            var database = client.GetDatabase(_mySettings.DatabaseName);
            _accountconfigs = database.GetCollection<Accounts>("accounts");
        }

        public AccountService(AppSettings appSetting)
        {
            _mySettings = appSetting;
            var client = new MongoClient(_mySettings.ConnectionString);
            var database = client.GetDatabase(_mySettings.DatabaseName);
            _accountconfigs = database.GetCollection<Accounts>("accounts");
        }

        public List<Accounts> Get() =>
            _accountconfigs.Find(AC => AC.Status == AccountStatus.active).ToList();

        public Accounts Get(string email) =>
            _accountconfigs.Find(AC => AC.Email == email).FirstOrDefault();

        public Accounts GetById(ObjectId Id) =>
    _accountconfigs.Find(obj => obj.Id == Id).FirstOrDefault();
        public Accounts Create(Accounts ac)
        {
            ac.DateCreated = System.DateTime.UtcNow;
            ac.DateUpdated = System.DateTime.UtcNow;
            _accountconfigs.InsertOne(ac);
            return ac;
        }

        public void Update(ObjectId id, Accounts AcIn) =>
            _accountconfigs.ReplaceOne(AC => AC.Id == id, AcIn);

        public void Remove(Accounts AcIn) =>
            _accountconfigs.DeleteOne(AC => AC.Id == AcIn.Id);

        public void Remove(ObjectId id) =>
            _accountconfigs.DeleteOne(AC => AC.Id == id);
    }
}
