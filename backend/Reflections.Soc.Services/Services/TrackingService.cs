using Reflections.Mailer.Services.Models;
using MongoDB.Driver;
using System.Collections.Generic;
using System.Linq;
using MongoDB.Bson;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;

namespace Reflections.Mailer.Services
{
    public class TrackingService
    {
        private readonly IMongoCollection<EmailTracking> _emailtracking;
        private readonly AppSettings _mySettings;
        public TrackingService(IOptions<AppSettings> appConf)
        {
            _mySettings = appConf.Value;
            var client = new MongoClient(_mySettings.ConnectionString);
            var database = client.GetDatabase(_mySettings.DatabaseName);
            _emailtracking = database.GetCollection<EmailTracking>("tracking");
        }

        public List<EmailTracking> Get() =>
            _emailtracking.Find(obj => true).ToList();

        public EmailTracking Get(ObjectId oId, string email) =>
            _emailtracking.Find(obj => obj.Email == email && obj.CampaignId == oId).FirstOrDefault();

        public EmailTracking Create(EmailTracking obj)
        {
            obj.DateCreated = System.DateTime.UtcNow;
            obj.DateUpdated = System.DateTime.UtcNow;
            _emailtracking.InsertOne(obj);
            return obj;
        }

        public void Update(string id, EmailTracking et) =>
            _emailtracking.ReplaceOne(obj => obj.Id == id, et);

        public void Remove(EmailTracking et) =>
            _emailtracking.DeleteOne(obj => obj.Id == et.Id);

        public void Remove(string id) =>
            _emailtracking.DeleteOne(obj => obj.Id == id);
    }
}
