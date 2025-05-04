using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Reflections.SolutionsPlus.TM
{
    public class CommonTask
    {
        private const int BATCHSIZE = 500;
        public void ProcessBatchGeneric<T>(List<T> objs, Action<List<T>> action)
        {
            int cProcessed = 0;
            int counter = 1;
            while (cProcessed < objs.Count)
            {
                var datas = objs.Skip((counter - 1) * BATCHSIZE).Take(BATCHSIZE).ToList();
                cProcessed = cProcessed + BATCHSIZE;
                counter++;
                if (datas.Count == 0)
                    break;

                action(datas);
            }
            action(null);
        }
    }
}
