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
    public class KvsService
    {
        private readonly IMongoCollection<KvsModel> _kvs;
        private readonly AppSettings _mySettings;

        public KvsService(IOptions<AppSettings> appConf)
        {
            _mySettings = appConf.Value;
            var client = new MongoClient(_mySettings.ConnectionString);
            var database = client.GetDatabase(_mySettings.DatabaseName);
            _kvs = database.GetCollection<KvsModel>("kvs");
        }

        public KvsService(AppSettings appSettings)
        {
            _mySettings = appSettings;
            var client = new MongoClient(_mySettings.ConnectionString);
            var database = client.GetDatabase(_mySettings.DatabaseName);
            _kvs = database.GetCollection<KvsModel>("kvs");
        }

        public KvsModel GetByKey(string key) =>
            _kvs.Find(u => u.Key == key).FirstOrDefault();

        public KvsModel Update(KvsModel kvs)
        {
            _kvs.ReplaceOne(s => s.Id == kvs.Id, kvs);
            return kvs;
        }
    }
}
