# CommentScope - AI Powered YouTube Comment Analysis

## Overview

CommentScope is a Chrome extension that allows users to scrape, analyze, and summarize comments from YouTube videos using chrome's built-in AI features. It provides insights into user sentiments and key points from the comments, making it easier to understand audience feedback.

## Features

- **Scrape Comments**: Fetch comments from any YouTube video by entering its URL.
- **AI Analysis**: Analyze comments to categorize them into complaints, pain points, user requests, and other insights.
- **User-Friendly Interface**: A clean and intuitive sidebar interface that integrates seamlessly with YouTube.
- **Chrome Built-in AI Implemented**: Implemented the Prompt API and the Summarizer API.

## Installation

1. Clone the repository or download the ZIP file.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable "Developer mode" in the top right corner.
4. Click on "Load unpacked" and select the directory where the extension files are located.
5. The CommentScope extension should now appear in your extensions list.
6. Make sure to follow setup instructions as per this doc "https://docs.google.com/document/d/1VG8HIyz361zGduWgNG7R_R8Xkv0OOJ8b5C9QKeCjU0c"

## Usage

1. Click on the CommentScope icon in the Chrome toolbar.
2. Enter a YouTube video URL in the input field.
3. Click the "Fetch Comments" button to scrape comments.
4. Use the "Summarize Comments" and "Analyze with AI" buttons to get insights from the comments.

## Technologies Used

- **HTML/CSS**: For the user interface.
- **JavaScript**: For functionality and API interactions.
- **YouTube Data API**: To fetch comments from YouTube.
- **AI Language Model**: For analyzing comments.

## API Key

Create a .env file and add your YouTube Data API key (YOUTUBE_API_KEY=YOUR_API_KEY).

## License

This project is licensed under the MIT License.

## Contributing

Contributions are welcome! If you have suggestions or improvements, feel free to open an issue or submit a pull request.

## Contact

For any inquiries or feedback, please reach out to sanky369@gmail.com.
