# Assets

This folder contains static resources for the module such as:

- Images
- Icons
- Sounds
- Other media files

## Recommended Structure

```
assets/
├── images/          # Module images
├── icons/           # Icons
├── sounds/          # Audio files
└── templates/       # HTML templates
```

## Supported Formats

- **Images**: PNG, JPG, JPEG, GIF, WebP
- **Sounds**: MP3, WAV, OGG
- **Others**: PDF, TXT, JSON

## How to Use

To reference assets in your JavaScript code:

```javascript
// Example of how to load an image
const imagePath = "modules/cyberpunk-agent/assets/images/example.png";
```

To use in CSS:

```css
.background-image {
    background-image: url("../assets/images/background.jpg");
}
``` 