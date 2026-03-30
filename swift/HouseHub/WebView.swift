import SwiftUI
import WebKit

// MARK: - Bundle URL Scheme Handler

/// Serves the bundled web app assets from the iOS app bundle using the
/// custom "app://" URL scheme. This allows React Router's client-side
/// navigation to work correctly without a network connection — any path
/// that doesn't match a real file falls back to `index.html` so the
/// SPA can handle the route itself.
final class BundleSchemeHandler: NSObject, WKURLSchemeHandler {

    func webView(_ webView: WKWebView, start task: WKURLSchemeTask) {
        guard let requestURL = task.request.url else {
            task.didFailWithError(URLError(.badURL))
            return
        }
        // Dispatch file I/O to a background queue so we don't block the WebKit rendering thread.
        DispatchQueue.global(qos: .userInitiated).async {
            self.serveFile(for: requestURL, task: task)
        }
    }

    func webView(_ webView: WKWebView, stop task: WKURLSchemeTask) {}

    // MARK: - Private

    private func serveFile(for url: URL, task: WKURLSchemeTask) {
        let path = url.path.isEmpty || url.path == "/" ? "/index.html" : url.path
        let relativePath = String(path.dropFirst()) // strip leading "/"

        guard let webAppURL = Bundle.main.resourceURL?.appendingPathComponent("WebApp") else {
            task.didFailWithError(URLError(.fileDoesNotExist))
            return
        }

        let fileURL = webAppURL.appendingPathComponent(relativePath)

        if let data = try? Data(contentsOf: fileURL) {
            respond(to: task, url: url, data: data, mimeType: mimeType(for: relativePath))
        } else {
            // Unknown path — fall back to index.html so React Router can handle routing.
            let indexURL = webAppURL.appendingPathComponent("index.html")
            if let data = try? Data(contentsOf: indexURL) {
                respond(to: task, url: url, data: data, mimeType: "text/html")
            } else {
                task.didFailWithError(URLError(.fileDoesNotExist))
            }
        }
    }

    private func respond(to task: WKURLSchemeTask, url: URL, data: Data, mimeType: String) {
        let response = URLResponse(
            url: url,
            mimeType: mimeType,
            expectedContentLength: data.count,
            textEncodingName: "utf-8"
        )
        task.didReceive(response)
        task.didReceive(data)
        task.didFinish()
    }

    private func mimeType(for path: String) -> String {
        let ext = (path as NSString).pathExtension.lowercased()
        switch ext {
        case "html":              return "text/html"
        case "js", "mjs", "cjs": return "application/javascript"
        case "css":               return "text/css"
        case "json":              return "application/json"
        case "png":               return "image/png"
        case "jpg", "jpeg":       return "image/jpeg"
        case "gif":               return "image/gif"
        case "svg":               return "image/svg+xml"
        case "ico":               return "image/x-icon"
        case "woff":              return "font/woff"
        case "woff2":             return "font/woff2"
        case "ttf":               return "font/ttf"
        case "otf":               return "font/otf"
        default:                  return "application/octet-stream"
        }
    }
}

// MARK: - SwiftUI View

struct WebView: UIViewRepresentable {

    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        configuration.setURLSchemeHandler(BundleSchemeHandler(), forURLScheme: "app")

        let webView = WKWebView(frame: .zero, configuration: configuration)
        webView.scrollView.bounces = false
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.isOpaque = false
        webView.backgroundColor = .clear

        let startURL = URL(string: "app://localhost/index.html")!
        webView.load(URLRequest(url: startURL))

        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {}
}
