using Reflections.SolutionsPlus.Services;
using Reflections.SolutionsPlus.Models;
using Newtonsoft.Json.Linq;
using System;
using System.IO;
using System.Reflection;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace Reflections.SolutionsPlus.TM
{
    class Program
    {
        private static bool isRunning = false;
        public static int Interval = 0;
        public static AppSettings APPSETTINGS = LoadConfig();
        static void Main(string[] args)
        {
            
            isRunning = true;
            try
            {
                while (isRunning)
                {
                    Updatelog($"Started OLAP process {DateTime.UtcNow}", false, true);
                    UPDATEOLAP();
                    Thread.Sleep(Interval * 1000 * 60);
                }
            }
            catch (Exception ex)
            {
                Updatelog($"Error :: {ex.Message}", true, true);
                Updatelog($"Stack Track :: {ex.StackTrace}", true, true);
                Updatelog($"Inner Exception :: {ex.InnerException}", true, true);
            }
            finally
            {
                isRunning = false;
            }
        }


        static void UPDATEOLAP()
        {
            SOCTask myTask = new SOCTask();
            myTask.updateOlap();
        }

        public static AppSettings LoadConfig()
        {
            var jsonText = File.ReadAllText("appsettings.json");
            var jo = JObject.Parse(jsonText);
            var appSettings = jo["AppConfigs"].ToString();
            Interval = Convert.ToInt32( jo["interval"].ToString());
            return APPSETTINGS = JsonSerializer.Deserialize<AppSettings>(appSettings);
        }



        #region "log"
        public static void Updatelog(string log, bool iserror, bool writetofile)
        {
            try
            {
                //this function updates the log file
                //every day there is one log file which is created
                //the function will check if the file exist the it will update the file or else it will create and then update the file.
                Environment.CurrentDirectory = Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location);
                string filepath = "logs";
                string logfile = Path.Combine(Environment.CurrentDirectory, filepath);
                var path = Path.GetFullPath(logfile);
                var filename = path + "\\" + DateTime.UtcNow.Month + "_" + DateTime.UtcNow.Date.Day + "_" + DateTime.UtcNow.Year + "_TM" + ".txt";
                log = log + "\r\n" + DateTime.UtcNow.ToString() + "\r\n";
                if (!Directory.Exists(path))
                    Directory.CreateDirectory(path);
                if (writetofile)
                {
                    if (!File.Exists(filename))
                    {
                        //this code segment write data to file.
                        FileStream fs1 = new FileStream(filename, FileMode.OpenOrCreate, FileAccess.Write);
                        using (StreamWriter sw = new StreamWriter(fs1))
                        {
                            sw.WriteLine(log);
                            sw.Close();
                        }
                    }
                    else
                    {
                        using (StreamWriter sw = File.AppendText(filename))
                        {
                            sw.WriteLine(log);
                        }
                    }
                }
                Console.WriteLine(log);
                //add code to update the log table
                if (iserror)
                    Console.ForegroundColor = ConsoleColor.Red;
                else
                    Console.ForegroundColor = ConsoleColor.Green;
            }
            catch (Exception ex) { }
        }
        #endregion
    }
}
