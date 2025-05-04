
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Reflections.SolutionsPlus.Models
{
    public class KvsModel
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public ObjectId Id { get; set; }

        [BsonElement("Key")]
        public string Key { get; set; }

        [BsonElement("Value")]
        public string Value { get; set; }

        #region "common fields"

        [BsonElement("DateCreated")]
        public DateTime DateCreated { get; set; }

        [BsonElement("DateUpdated")]
        public DateTime DateUpdated { get; set; }

        [BsonElement("Status")]
        public RecordStatus Status { get; set; }



        #endregion
    }

}
