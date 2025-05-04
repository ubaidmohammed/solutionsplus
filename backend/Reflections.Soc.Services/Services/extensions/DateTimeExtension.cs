using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Reflections.SolutionsPlus.Services.extensions
{
    public static class DateTimeExtension
    {
        private static readonly System.DateTime dt_base = new System.DateTime(2010, 1, 1);
        private static readonly long js_ticks_1970 = (new System.DateTime(1970, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc)).Ticks;
        public static readonly DateTime defaultDate = new DateTime(1800, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc);
        public static short GetTotalDays(this System.DateTime dt, string tz = null)
        {
            var diff = dt - dt_base;
            if (tz != null)
            {
                var standardTime = ConvertToLocalTime(dt, tz);
                diff = standardTime - dt_base;
            }
            return (short)diff.TotalDays;
        }

        public static short GetTotalWeeks(this System.DateTime dt)
        {
            var diff = dt - dt_base;
            return (short)(diff.TotalDays / 7f);
        }

        public static byte GetTotalMonths(this System.DateTime dt)
        {
            return (byte)((dt.Year * 12 + dt.Month) - (dt_base.Year * 12 + dt_base.Month));
        }

        public static byte GetTotalYears(this System.DateTime dt)
        {
            return (byte)(dt.Year - dt_base.Year);
        }

        public static long GetJavascriptTimestamp(this System.DateTime input)
        {
            System.TimeSpan span = new System.TimeSpan(js_ticks_1970);
            System.DateTime time = input.Subtract(span);
            return (time.Ticks / 10000);
        }

        #region Long Range DateTime
        public static Int32 _GetTotalDays(this System.DateTime dt)
        {
            var diff = dt - dt_base;
            return (Int32)diff.TotalDays;
        }

        public static Int32 _GetTotalWeeks(this System.DateTime dt)
        {
            var diff = dt - dt_base;
            return (Int32)(diff.TotalDays / 7f);
        }

        public static Int16 _GetTotalMonths(this System.DateTime dt)
        {
            return (Int16)((dt.Year * 12 + dt.Month) - (dt_base.Year * 12 + dt_base.Month));
        }

        public static Int16 _GetTotalYears(this System.DateTime dt)
        {
            return (Int16)(dt.Year - dt_base.Year);
        }

        public static Int32 _GetTotalHours(this System.DateTime dt)
        {
            var diff = dt - dt_base;
            return (Int32)diff.TotalHours;
        }

        public static DateTime GetDateFromDays(Int16 days)
        {
            return dt_base.AddDays(days);
        }

        public static DateTime GetDateFromMonth(Int16 months)
        {
            return dt_base.AddMonths(months);
        }
        public static DateTime GetDateFromYear(Int16 year)
        {
            return dt_base.AddYears(year);
        }

        public static DateTime ConvertToLocalTime(DateTime utcDate, string timeZoneName)
        {
            if (string.IsNullOrEmpty(timeZoneName))
                return utcDate;

            return TimeZoneInfo.ConvertTimeFromUtc(utcDate, TimeZoneInfo.FindSystemTimeZoneById(timeZoneName));
        }

        #endregion Long Range DateTime
    }
}
