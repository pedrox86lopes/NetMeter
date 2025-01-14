# NetMeter
A simple Chrome extension to send data to a local Flask server

### Steps to Load the Extension
Open Chrome and go to chrome://extensions/.
Enable Developer Mode (toggle in the upper-right corner).
Click Load unpacked.
Select your /my_local_extension folder.

### Testing the Extension
Ensure your Flask server is running on http://localhost:5000.
Open any website in Chrome.
Check your Flask server's console to see if it received the POST request from the extension.
You can also check the Chrome DevTools (Console tab) for logs from nm.js.
