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

namespace Reflections.Soc.Models
{
    public class Campaigns
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        [BsonElement("AccountId")]
        public ObjectId AccountId { get; set; }

        [BsonElement("Body")]
        public string Body { get; set; }

        [BsonElement("Subject")]
        public string Subject { get; set; }

        [BsonElement("Sms")]
        public string Sms { get; set; }

        [BsonElement("CommonVariables")]
        public string CommonVariables { get; set; }

        [BsonElement("UserVariables")]
        public string UserVariables { get; set; }

        [BsonElement("SendDate")]
        public DateTime SendDate { get; set; }


        [BsonElement("Parsed")]
        public bool Parsed { get; set; }

        [BsonElement("LogId")]
        public ObjectId? LogId { get; set; }

        #region "common fields"

        [BsonElement("DateCreated")]
        public DateTime DateCreated { get; set; }

        [BsonElement("DateUpdated")]
        public DateTime DateUpdated { get; set; }

        #endregion

        
    }

    public class CampaignInput
    {
        public string sendfrom { get; set; }
        public string templatename { get; set; }
        public List<VarVal> commonvars { get; set; }
        public List<UserVars> uservars { get; set; }
    }

    public class ParsedCampaignInput
    {
        public string sendfrom { get; set; }
        public string subject { get; set; }
        public string body { get; set; }
        public List<UserVars> uservars { get; set; }
    }

    public class VarVal
    {
        public string var { get; set; }
        public string val { get; set; }

    }
    public class UserVars
    {
        public string email { get; set; }
        public string phone { get; set; }
        public string _id { get; set; }
        public bool emailoptedout { get; set; }
        public bool smsoptedout { get; set; }
        public List<VarVal> details { get; set; }
    }

}
