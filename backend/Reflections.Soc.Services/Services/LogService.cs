using Reflections.Mailer.Services.Models;
using MongoDB.Driver;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using MongoDB.Bson;

namespace Reflections.Mailer.Services
{
    public class LogService
    {
        private readonly IMongoCollection<Logs> _logs;
        private readonly AppSettings _mySettings;

        public LogService(IOptions<AppSettings> appConf)
        {
            _mySettings = appConf.Value;
            var client = new MongoClient(_mySettings.ConnectionString);
            var database = client.GetDatabase(_mySettings.DatabaseName);
            _logs = database.GetCollection<Logs>("logs");
        }

        public LogService(AppSettings appSetting)
        {
            _mySettings = appSetting;
            var client = new MongoClient(_mySettings.ConnectionString);
            var database = client.GetDatabase(_mySettings.DatabaseName);
            _logs = database.GetCollection<Logs>("logs");
        }

        public List<Logs> Get() =>
            _logs.Find(obj => true).ToList();

        public Logs Get(ObjectId Id) =>
            _logs.Find(obj => obj.Id == Id).FirstOrDefault();

        public Logs Create(Logs log)
        {
            log.DateCreated = System.DateTime.UtcNow;
            log.DateUpdated = System.DateTime.UtcNow;
            _logs.InsertOne(log);
            return log;
        }

        public void Update(ObjectId  id, Logs log) =>
            _logs.ReplaceOne(obj => obj.Id == id, log);

        public void Remove(Logs log) =>
            _logs.DeleteOne(obj => obj.Id == log.Id);

        public void Remove(ObjectId id) =>
            _logs.DeleteOne(obj => obj.Id == id);
    }
}
