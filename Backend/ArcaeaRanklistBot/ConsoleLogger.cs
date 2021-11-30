using System;
using System.IO;

namespace ArcaeaRanklistBot
{
    using System;
    using System.Diagnostics;
    internal class ConsoleLogger : ILogger ,IDisposable
    {
        private readonly string logfile;
        private readonly StreamWriter logstream;
        private int eventId;
        public ConsoleLogger(string logfile="log.txt")
        {
            this.logfile = logfile;
            this.logstream = File.Exists(logfile) ? File.AppendText(logfile) : File.CreateText(logfile);
            eventId = 0;
        }

        public void Log(TraceEventType eventType, string message, params object[] parameters)
        {
            string actualMessage = IsNullOrEmpty(parameters) ? message : string.Format(message, parameters);
            string logMessage = string.Format("{0}-{1}[{2}]: {3}", eventType, eventId++, DateTime.Now.ToString("G"), actualMessage);
            Console.Out.WriteLine(logMessage);
            logstream.WriteLine(logMessage);
        }

        private static bool IsNullOrEmpty(params object[] parameters)
        {
            return parameters == null || parameters.Length == 0;
        }

        #region IDisposable Support
        private bool disposedValue = false; // 要检测冗余调用

        protected virtual void Dispose(bool disposing)
        {
            if (!disposedValue)
            {
                if (disposing)
                {
                    this.logstream.Close();
                }

                // TODO: 释放未托管的资源(未托管的对象)并在以下内容中替代终结器。
                // TODO: 将大型字段设置为 null。

                disposedValue = true;
            }
        }

        // TODO: 仅当以上 Dispose(bool disposing) 拥有用于释放未托管资源的代码时才替代终结器。
        // ~ConsoleLogger() {
        //   // 请勿更改此代码。将清理代码放入以上 Dispose(bool disposing) 中。
        //   Dispose(false);
        // }

        // 添加此代码以正确实现可处置模式。
        public void Dispose()
        {
            // 请勿更改此代码。将清理代码放入以上 Dispose(bool disposing) 中。
            Dispose(true);
            // TODO: 如果在以上内容中替代了终结器，则取消注释以下行。
            // GC.SuppressFinalize(this);
        }
        #endregion
    }
}
