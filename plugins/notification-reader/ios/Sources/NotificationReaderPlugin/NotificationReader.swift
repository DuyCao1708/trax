import Foundation

@objc public class NotificationReader: NSObject {
    @objc public func echo(_ value: String) -> String {
        print(value)
        return value
    }
}
