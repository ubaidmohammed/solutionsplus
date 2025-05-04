using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Newtonsoft.Json.Linq;

namespace Reflections.Mailer.Services.Models
{
    public class Logs
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public ObjectId Id { get; set; }

        [BsonElement("Message")]
        public string Message { get; set; }

        #region "common fields"

        [BsonElement("DateCreated")]
        public DateTime DateCreated { get; set; }

        [BsonElement("DateUpdated")]
        public DateTime DateUpdated { get; set; }
        #endregion

        public void UpdateLog(string key, string value)
        {
            if(Message == null)
                Message = string.Empty;
            Message += value;
        }
    }
}
