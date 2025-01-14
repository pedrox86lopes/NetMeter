function sendTestData() {
    const data = {
        v: "1.0",
        id: "CH",
        code: "test-code",
        sessionId: "test-session",
        data: { message: "Hello from Chrome Extension!" }
    };

    fetch("http://localhost:5000/nmcollector", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => console.log("Server response:", data))
    .catch(error => console.error("Error:", error));
}

chrome.action.onClicked.addListener((tab) => {
    sendTestData();
});
