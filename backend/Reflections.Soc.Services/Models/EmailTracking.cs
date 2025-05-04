using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Reflections.Mailer.Services.Models
{
    public class EmailTracking
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        [BsonElement("CampaignId")]
        public ObjectId CampaignId { get; set; }

        [BsonElement("Email")]
        public string Email { get; set; }

        [BsonElement("LastOpen")]
        public DateTime LastOpen { get; set; }

        [BsonElement("OpenHistory")]
        public List<DateTime> OpenHistory { get; set; }

        #region "common fields"

        [BsonElement("DateCreated")]
        public DateTime DateCreated { get; set; }

        [BsonElement("DateUpdated")]
        public DateTime DateUpdated { get; set; }

        #endregion
    }
}
