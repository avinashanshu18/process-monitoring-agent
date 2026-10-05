// swift-tools-version: 5.10
import PackageDescription

let package = Package(
    name: "HostLensEndpointSecurity",
    platforms: [
        .macOS(.v13),
    ],
    products: [
        .executable(name: "hostlens-endpoint-security", targets: ["HostLensEndpointSecurity"]),
    ],
    targets: [
        .executableTarget(
            name: "HostLensEndpointSecurity",
            path: "Sources"
        ),
    ]
)
