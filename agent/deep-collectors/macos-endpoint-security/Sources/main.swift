import Foundation
import EndpointSecurity

struct HelperEnvelope: Encodable {
    let source: String
    let process_events: [[String: String]]
    let collector_capabilities: [[String: String]]
}

final class EndpointSecurityEmitter {
    private var client: OpaquePointer?
    private let spoolDir: URL

    init(spoolDir: URL) {
        self.spoolDir = spoolDir
    }

    func start() throws {
        try FileManager.default.createDirectory(at: spoolDir, withIntermediateDirectories: true, attributes: nil)
        var clientRef: OpaquePointer?
        let result = es_new_client(&clientRef) { _, message in
            guard let message else {
                return
            }
            EndpointSecurityEmitter.handle(message: message)
        }

        guard result == ES_NEW_CLIENT_RESULT_SUCCESS, let clientRef else {
            try writeCapability(state: "not-enabled", detail: "Endpoint Security entitlement or root approval is missing.")
            RunLoop.main.run()
            return
        }

        self.client = clientRef
        let subscriptions: [es_event_type_t] = [
            ES_EVENT_TYPE_NOTIFY_EXEC,
            ES_EVENT_TYPE_NOTIFY_EXIT,
        ]
        es_subscribe(clientRef, subscriptions, UInt32(subscriptions.count))
        try writeCapability(state: "active", detail: "Endpoint Security helper is subscribed to exec and exit notifications.")
        RunLoop.main.run()
    }

    deinit {
        if let client {
            es_delete_client(client)
        }
    }

    private static var sharedSpoolDir: URL = URL(fileURLWithPath: NSTemporaryDirectory())

    static func configureSharedSpoolDir(_ value: URL) {
        sharedSpoolDir = value
    }

    private static func handle(message: UnsafePointer<es_message_t>) {
        let eventType = message.pointee.event_type
        switch eventType {
        case ES_EVENT_TYPE_NOTIFY_EXEC:
            let process = message.pointee.process.pointee
            let executable = tokenString(process.executable.pointee.path)
            let name = URL(fileURLWithPath: executable).lastPathComponent
            write(
                source: "endpoint-security",
                processEvents: [[
                    "pid": String(audit_token_to_pid(process.audit_token)),
                    "ppid": String(audit_token_to_pid(process.parent_audit_token)),
                    "name": name,
                    "exe_path": executable,
                    "event_type": "started",
                    "occurred_at": ISO8601DateFormatter().string(from: Date()),
                ]],
                detail: "Endpoint Security helper observed exec."
            )
        case ES_EVENT_TYPE_NOTIFY_EXIT:
            let process = message.pointee.process.pointee
            let executable = tokenString(process.executable.pointee.path)
            let name = URL(fileURLWithPath: executable).lastPathComponent
            write(
                source: "endpoint-security",
                processEvents: [[
                    "pid": String(audit_token_to_pid(process.audit_token)),
                    "ppid": String(audit_token_to_pid(process.parent_audit_token)),
                    "name": name,
                    "exe_path": executable,
                    "event_type": "exited",
                    "occurred_at": ISO8601DateFormatter().string(from: Date()),
                ]],
                detail: "Endpoint Security helper observed exit."
            )
        default:
            break
        }
    }

    private func writeCapability(state: String, detail: String) throws {
        EndpointSecurityEmitter.write(
            source: "endpoint-security",
            processEvents: [],
            detail: detail,
            state: state,
            spoolDir: spoolDir
        )
    }

    private static func write(
        source: String,
        processEvents: [[String: String]],
        detail: String,
        state: String = "active",
        spoolDir: URL = sharedSpoolDir
    ) {
        let envelope = HelperEnvelope(
            source: source,
            process_events: processEvents,
            collector_capabilities: [[
                "name": source,
                "layer": "kernel-bridge",
                "state": state,
                "detail": detail,
            ]]
        )
        let encoder = JSONEncoder()
        guard let data = try? encoder.encode(envelope) else {
            return
        }
        let file = spoolDir.appendingPathComponent("\(source)-\(UUID().uuidString).json")
        try? data.write(to: file)
    }
}

func tokenString(_ token: es_string_token_t) -> String {
    guard token.length > 0, let data = token.data else {
        return ""
    }
    return String(bytesNoCopy: UnsafeMutableRawPointer(mutating: data), length: Int(token.length), encoding: .utf8, freeWhenDone: false) ?? ""
}

let arguments = CommandLine.arguments
let spoolDirArg = arguments.dropFirst().first ?? FileManager.default.currentDirectoryPath
let spoolDir = URL(fileURLWithPath: spoolDirArg, isDirectory: true)
EndpointSecurityEmitter.configureSharedSpoolDir(spoolDir)

do {
    let emitter = EndpointSecurityEmitter(spoolDir: spoolDir)
    try emitter.start()
} catch {
    fputs("hostlens-endpoint-security error: \(error)\n", stderr)
    exit(1)
}
