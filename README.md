# Audio to Video Chrome Extension

A 100% local Chrome Extension that converts audio files and background images into video files using the browser's MediaRecorder API.

## Features
- **Privacy:** No data is uploaded to any server. Everything happens in your browser.
- **Visuals:** Displays a real-time progress bar and time-remaining countdown.

## ⏱️ Real-Time Conversion
Unlike cloud-based converters that process files on a server, this extension performs **Real-Time Encoding**. 

- **How it works:** The extension plays the audio through a virtualized Web Audio pipeline while simultaneously capturing the canvas frames.
- **Duration:** If your audio is 3 minutes long, the conversion will take approximately 3 minutes.
- **Stability:** By processing in real-time locally, we ensure the highest synchronization between the audio and the background image without losing frames.

## Installation
1. Download this repository as a ZIP file and extract it.
2. Open Google Chrome and go to `chrome://extensions`.
3. Enable **Developer Mode** in the top-right corner.
4. Click **Load unpacked**.
5. Select the extracted folder.

## How to Use
1. Click the extension icon to open the converter tab.
2. Select your audio file and background image.
3. Click **Start Conversion**.
4. Keep the worker tab open until the "Save As" window appears.

## Credits
- Built using the [MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)
- UI designed with standard HTML5/CSS3
