# Bakht

**Bakht** (means "luck" in Persian) is a [webxdc](https://webxdc.org) app that runs inside **Delta Chat**, providing two methods for making random decisions:

- 🎡 **Wheel** — enter your options (one per line, up to 50) and spin the wheel to pick a winner.
- 🔢 **Number** — pick a random number within any range (up to 1,000,000,000).

## Features

- **Spin wheel** with animated acceleration and deceleration physics
- **Random number picker** with a rolling "slot machine" animation
- **Optional share results to the chat** — the options and winning result is posted as a webxdc update, so other chat members can open it and *try the same options themselves*
- **i18n supported** — Persian (فارسی, RTL) and English, with language auto-detection and a persisted preference

## Development

The app is plain HTML/CSS/JS with no build step. Open `index.html` directly in a browser to develop — `webxdc.js` provides a stub of the webxdc API so everything works outside Delta Chat (results are logged to the console instead of posted to a chat).

To test real chat integration, package the folder as a `.xdc` file (a ZIP archive containing `index.html`, `manifest.toml`, and the other assets) and share it in a Delta Chat chat.

### Adding a language

Add a new dictionary entry in `i18n.js` (copy the `en` block and translate the strings).
