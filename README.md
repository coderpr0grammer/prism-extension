# PrismAI Companion

A Chrome extension that automates interactions with PostHog session recordings.

## Features

- Automatically detects PostHog session recording pages
- Extracts session recording ID from URL
- Automates filter setup:
  - Sets date range to "All time"
  - Sets duration filter to 0 seconds
  - Adds session ID filter with the current session ID

## Installation

1. Clone this repository or download the files
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the directory containing these files
5. The extension should now appear in your Chrome toolbar

## Usage

1. Navigate to any PostHog session recording URL
2. The extension will automatically run and set up the filters
3. You can verify the automation worked by checking the console for success messages

## Requirements

- Google Chrome browser
- PostHog session recording URL with a valid `sessionRecordingId` parameter

## Development

The extension consists of:
- `manifest.json`: Extension configuration
- `content.js`: Main automation script
- `icon48.png` and `icon128.png`: Extension icons (you'll need to add these)

## Troubleshooting

If the automation doesn't work:
1. Check the console for error messages
2. Verify you're on a valid PostHog session recording URL
3. Make sure the page is fully loaded before the automation starts 