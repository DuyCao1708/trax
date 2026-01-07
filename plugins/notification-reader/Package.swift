// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "NotificationReader",
    platforms: [.iOS(.v15)],
    products: [
        .library(
            name: "NotificationReader",
            targets: ["NotificationReaderPlugin"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.0.0")
    ],
    targets: [
        .target(
            name: "NotificationReaderPlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm")
            ],
            path: "ios/Sources/NotificationReaderPlugin"),
        .testTarget(
            name: "NotificationReaderPluginTests",
            dependencies: ["NotificationReaderPlugin"],
            path: "ios/Tests/NotificationReaderPluginTests")
    ]
)