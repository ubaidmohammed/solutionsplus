using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Reflections.SolutionsPlus.Models
{
    public class Users
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public ObjectId Id { get; set; }

        [BsonElement("UserName")]
        public string UserName { get; set; }

        [BsonElement("Email")]
        public string Email { get; set; }

        [BsonElement("Password")]
        public string Password { get; set; }

        [BsonElement("Initials")]
        public string Initials { get; set; }

        [BsonElement("Name")]
        public string Name { get; set; }

        [BsonElement("Role")]
        public UserRoles Role { get; set; }

        #region "common fields"

        [BsonElement("DateCreated")]
        public DateTime DateCreated { get; set; }

        [BsonElement("DateUpdated")]
        public DateTime DateUpdated { get; set; }

        [BsonElement("Status")]
        public RecordStatus Status { get; set; }

        [BsonElement("ObjectId")]
        public string ObjectId { get; set; }

        #endregion

    }
}
