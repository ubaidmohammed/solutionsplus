using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Reflections.Mailer.Services.Models
{
    public class Accounts
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public ObjectId Id { get; set; }

        [BsonElement("Email")]
        public string Email { get; set; }

        [BsonElement("Token")]
        public string Token { get; set; }

        [BsonElement("RefreshToken")]
        public string RefreshToken { get; set; }

        [BsonElement("SendMethod")]
        public EmailSendingOptions SendMethod { get; set; }

        [BsonElement("PopUserName")]
        public string PopUserName { get; set; }
        
        [BsonElement("PopDisplayName")]
        public string PopDisplayName { get; set; }

        [BsonElement("PopPassword")]
        public string PopPassword { get; set; }
        
        [BsonElement("PopSMTP")]
        public string PopSMTP { get; set; }
        
        [BsonElement("PopPort")]
        public int PopPort { get; set; }


        [BsonElement("TwilioAccountSID")]
        public string TwilioAccountSID { get; set; }

        [BsonElement("TwilioToken")]
        public string TwilioToken { get; set; }


        [BsonElement("TwilioFromNumber")]
        public string TwilioFromNumber { get; set; }

        #region "common fields"

        [BsonElement("DateCreated")]
        public DateTime DateCreated { get; set; }

        [BsonElement("DateUpdated")]
        public DateTime DateUpdated { get; set; }


        [BsonElement("Status")]
        public AccountStatus Status { get; set; }

        #endregion
    }
}
