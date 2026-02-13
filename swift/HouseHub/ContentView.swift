import SwiftUI

struct ContentView: View {
    
    var body: some View {
        WebView(url: URL(string: "http://localhost:5173")!)
            .ignoresSafeArea()
    }
}
