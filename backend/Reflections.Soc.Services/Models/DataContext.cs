using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Reflections.Mailer.Services.Models
{
    public enum CampaignStatus
    {
        pending=1,
        sent=2,
        failed=3
    }

    public enum AccountStatus
    {
        active = 1,
        deleted = 2
    }
    public class DataContext
    {
        public class GmailDatabaseSettings : IGmailDatabaseSettings
        {
            public string ConnectionString { get; set; }
            public string DatabaseName { get; set; }
        }

        public interface IGmailDatabaseSettings
        {
            string ConnectionString { get; set; }
            string DatabaseName { get; set; }
        }
    }
}
