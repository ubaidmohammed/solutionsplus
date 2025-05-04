using Reflections.Soc.Models;
using MongoDB.Driver;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.DependencyInjection;
using MongoDB.Bson;

namespace Reflections.Soc.Services
{
    public class CampaignService
    {
        private readonly IMongoCollection<Campaigns> _campaigns;
        private readonly AppSettings _mySettings;

        [ActivatorUtilitiesConstructorAttribute]
        public CampaignService(IOptions<AppSettings> appConf)
        {
            _mySettings = appConf.Value;
            var client = new MongoClient(_mySettings.ConnectionString);
            var database = client.GetDatabase(_mySettings.DatabaseName);
            _campaigns = database.GetCollection<Campaigns>("campaigns");
        }

        public CampaignService(AppSettings appSettings)
        {
            _mySettings = appSettings;
            var client = new MongoClient(_mySettings.ConnectionString);
            var database = client.GetDatabase(_mySettings.DatabaseName);
            _campaigns = database.GetCollection<Campaigns>("campaigns");
        }

        public List<Campaigns> Get() =>
            _campaigns.Find(AC => true).ToList();


        public Campaigns Create(Campaigns ac)
        {
            ac.DateCreated = System.DateTime.UtcNow;
            ac.DateUpdated = System.DateTime.UtcNow;
            _campaigns.InsertOne(ac);
            return ac;
        }

        public void Update(string id, Campaigns AcIn) =>
            _campaigns.ReplaceOne(AC => AC.Id == id, AcIn);

        public void Remove(Campaigns AcIn) =>
            _campaigns.DeleteOne(AC => AC.Id == AcIn.Id);

        public void Remove(string id) =>
            _campaigns.DeleteOne(AC => AC.Id == id);
    }
}
