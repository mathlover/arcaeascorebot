
namespace ArcaeaRanklistBot
{
    using System.Diagnostics;
    public interface ILogger
    {
        void Log(TraceEventType eventType, string message, params object[] parameters);
    }
}
