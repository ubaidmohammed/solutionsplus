using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Newtonsoft.Json.Converters;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json.Bson;
using System.Text.Json;

namespace Reflections.Mailer.Services.Models
{
    public class Templates
    {
        [BsonId]
        public ObjectId Id { get; set; }

        [BsonElement("AccountId")]
        public ObjectId AccountId { get; set; }

        [BsonElement("Name")]
        public string Name { get; set; }//Should be unique for a particular Install

        [BsonElement("Body")]
        public string Body { get; set; }

        [BsonElement("Subject")]
        public string Subject { get; set; }

        [BsonElement("Status")]
        public CampaignStatus Status { get; set; }

        [BsonElement("Sms")]
        public string Sms { get; set; }

        #region "common fields"

        [BsonElement("DateCreated")]
        public DateTime DateCreated { get; set; }

        [BsonElement("DateUpdated")]
        public DateTime DateUpdated { get; set; }

        #endregion
    }
}
