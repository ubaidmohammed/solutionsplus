using Reflections.SolutionsPlus.Models;
using Reflections.SolutionsPlus.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Reflections.SolutionsPlus.TM
{
    public class SOCTask
    {
        KvsService _kvs;

        public SOCTask()
        {
            _kvs = new KvsService(Program.APPSETTINGS ?? Program.LoadConfig());

        }
        public KvsModel GetByKey(string key)
        {
            return _kvs.GetByKey(key);
        }

        public void updateOlap()
        {
            KvsModel _kvsModel = _kvs.GetByKey("olaplastsynch");
            if (_kvsModel == null)
            {
                return;
            }
            //Updatelog($"Error :: 'No KVS configured'", true, true);
            DateTime startTime = DateTime.Parse(_kvsModel.Value);
            DateTime endTime = DateTime.UtcNow;

        }
    }
}
