using Reflections.Mailer.Services.Models;
using MongoDB.Driver;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using MongoDB.Bson;

namespace Reflections.Mailer.Services
{
    public class TemplateService
    {
        private readonly IMongoCollection<Templates> _templates;
        private readonly AppSettings _mySettings;

        public TemplateService(IOptions<AppSettings> appConf)
        {
            _mySettings = appConf.Value;
            var client = new MongoClient(_mySettings.ConnectionString);
            var database = client.GetDatabase(_mySettings.DatabaseName);
            _templates = database.GetCollection<Templates>("templates");
        }

        public List<Templates> Get() =>
            _templates.Find(obj => true).ToList();

        public Templates Get(ObjectId Id) =>
            _templates.Find(obj => obj.Id == Id).FirstOrDefault();

        public Templates Get(string name, ObjectId accountId) =>
    _templates.Find(obj => obj.Name == name && obj.AccountId == accountId).FirstOrDefault();

        public Templates Create(Templates ac)
        {
            ac.DateCreated = System.DateTime.UtcNow;
            ac.DateUpdated = System.DateTime.UtcNow;
            _templates.InsertOne(ac);
            return ac;
        }

        public void Update(ObjectId  id, Templates TempIn) =>
            _templates.ReplaceOne(obj => obj.Id == id, TempIn);

        public void Remove(Templates TempIn) =>
            _templates.DeleteOne(obj => obj.Id == TempIn.Id);

        public void Remove(ObjectId id) =>
            _templates.DeleteOne(obj => obj.Id == id);
    }
}
