using System.Text.Json;
using Microsoft.Diagnostics.Tracing.Parsers.Kernel;
using Microsoft.Diagnostics.Tracing.Session;

if (args.Length == 0)
{
    Console.Error.WriteLine("Usage: HostLens.EtwHelper <spool-dir>");
    return;
}

var spoolDir = args[0];
Directory.CreateDirectory(spoolDir);

WriteCapability(spoolDir, "available", "ETW helper started. Kernel process and TCP providers are attached.");

using var session = new TraceEventSession("HostLensEtwCollector");
session.StopOnDispose = true;
session.EnableKernelProvider(
    KernelTraceEventParser.Keywords.Process |
    KernelTraceEventParser.Keywords.NetworkTCPIP
);

session.Source.Kernel.ProcessStart += data =>
{
    WriteEnvelope(spoolDir, new
    {
        source = "etw",
        process_events = new[]
        {
            new
            {
                pid = data.ProcessID,
                ppid = data.ParentID,
                name = data.ProcessName,
                event_type = "started",
                occurred_at = DateTimeOffset.UtcNow.ToString("O")
            }
        }
    });
};

session.Source.Kernel.ProcessStop += data =>
{
    WriteEnvelope(spoolDir, new
    {
        source = "etw",
        process_events = new[]
        {
            new
            {
                pid = data.ProcessID,
                name = data.ProcessName,
                event_type = "exited",
                occurred_at = DateTimeOffset.UtcNow.ToString("O")
            }
        }
    });
};

session.Source.Kernel.TcpIpConnect += data =>
{
    WriteEnvelope(spoolDir, new
    {
        source = "etw",
        network_events = new[]
        {
            new
            {
                pid = data.ProcessID,
                process_name = data.ProcessName,
                protocol = "tcp",
                remote_address = data.daddr?.ToString(),
                remote_port = data.dport,
                local_address = data.saddr?.ToString(),
                local_port = data.sport,
                event_type = "opened",
                occurred_at = DateTimeOffset.UtcNow.ToString("O"),
                security_hint = "observed"
            }
        }
    });
};

session.Source.Process();

static void WriteCapability(string spoolDir, string state, string detail)
{
    WriteEnvelope(spoolDir, new
    {
        source = "etw",
        collector_capabilities = new[]
        {
            new
            {
                name = "etw",
                layer = "kernel-bridge",
                state,
                detail
            }
        }
    });
}

static void WriteEnvelope(string spoolDir, object payload)
{
    var fileName = Path.Combine(spoolDir, $"etw-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}-{Guid.NewGuid():N}.json");
    File.WriteAllText(fileName, JsonSerializer.Serialize(payload));
}
