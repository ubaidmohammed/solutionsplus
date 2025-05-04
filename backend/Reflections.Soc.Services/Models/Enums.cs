using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Reflections.SolutionsPlus.Models
{
    public enum RecordStatus : Int16
    {
        Active = 1,
        Deleted = 0,
        Temporary = 2
    }

    public enum UserRoles : Int16
    {
        Manager = 1,
        Analyst = 2
    }

    public enum NatureOfCallType : Int16
    {
        All=-1,
        Theft = 1,
        Detained = 2,
        Recovery = 3,
        StandOut = 4,
        BannedPerson = 5,
        TheftOther = 6,
        FirstAid = 7,
        PreAlarm = 8,
        EmergencyServicesCallOut = 9,
        CustomerRelation = 10,
        Harassment = 11,
        AntiSocialBehaviour = 12,
        AggressiveCustumer = 13,
        IntoxicatedPerson = 14,
        Events = 15,
        Protests = 16,
        CarPark = 17,
        LoadingBay = 18,
        ExternalActivity = 19,
        InternalActivity = 20,
        CCTVMonitoringRequest = 21,
        StaffIncident = 22,
        FootageRequest = 23,
        MissingProducts = 24,
        FireAlarm = 25,
        CustomerLiftEntrapment =26,
        MissingPerson = 27,
        OneNumberCall = 28
    }

    public enum DeptDivisionType : Int16
    {
        Menswear = 1,
        Beauty = 2,
        Food = 3,
        Accessories = 4,
        WomensStudios = 5,
        Childrenswear = 6,
        WomensGalleries = 7,
        Home = 8,
        WonderRoom = 9
    }

    public enum OwnershipType : Int16
    {
        Concession = 1,
        OwnBought = 2
    }

    public enum ConfirmFootage : Int16
    {
        FootageSaved = 1,
        FootagePending = 2,
        FootageInconclusive = 3,
        NoCameraCoverage = 4
    }

    public enum SlSubmitted : Int16
    {
        No = 1,
        Yes = 2,
        Approved = 3,
        Rejected = 4
    }

}