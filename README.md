# Pinned Tabs

An extension that allows you to pin tabs across browser restarts and manage them with powerful matching options.

## Features

- Pin tabs across browser restarts
- Automatically restore pinned tabs when browser starts
- Multiple matching options:
    - **Exact URL**: Match only the exact URL
    - **Domain Only**: Match any page on the same domain
    - **RegEx Pattern**: Create custom patterns to match URLs using regular expressions
- Drag and drop interface to reorder pinned tabs
- Dark theme UI for reduced eye strain
- Manage pinned tabs (add, remove, modify match type)
- Bulk operations (open all, close all, resync)

## Development Setup

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Build the extension:
   ```
   npm run build
   ```
4. For development with automatic rebuilding:
   ```
   npm run watch
   ```

### Generating Icons

The extension comes with pre-generated icons, but if you want to regenerate them:

```
npm run generate-icons
```

This will create icon files (16px, 48px, and 128px) in the `icons/` directory.

### Updating Version

To update both package.json and manifest.json version numbers:

```
npm run version 1.0.1
```

Replace `1.0.1` with your desired version number in the format `x.y.z`.

### Packaging for Distribution

To create a distribution package for the Chrome Web Store:

```
npm run package:prod
```

This will:

1. Build the extension
2. Create a ZIP file in the `packages/` directory
3. Name the package with the current version from package.json

The generated ZIP file can be directly uploaded to the Chrome Web Store.

## Installation in Chrome

1. Build the extension `npm run build`
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the `dist` folder from this project
5. The extension should now be installed and visible in your extensions toolbar

## Usage

### Pinning a Tab

1. Navigate to the page you want to pin
2. Click the Pinned Tabs extension icon in the toolbar
3. Select a match type:
    - **Exact URL**: Only match the exact URL of the current tab
    - **Domain only**: Match any page on the same domain
    - **RegEx Pattern**: Create a custom pattern to match URLs
        - If selected, you can edit the pre-filled pattern or use the "Make Path Wildcard" button
4. Click "Pin Current Tab"

### Using RegEx Patterns

With RegEx patterns, you can create flexible matching rules:

- Use `.*` to match any characters
- Use `/?.* ` at the end of a path to match with or without trailing slash
- Examples:
    - `https://example\.com/path/.*` - Match any URL that starts with this path
    - `https://.*\.example\.com/` - Match any subdomain of example.com
    - `https://example\.com/.*/item` - Match any URL with 'item' after any directory

The "Make Path Wildcard" button automatically creates a pattern that matches all pages under the current path.

### Managing Pinned Tabs

1. Click the Pinned Tabs extension icon
2. Click "Manage Pinned Tabs"
3. From this page, you can:
    - Drag and drop tabs to reorder them
    - Change the match type (Exact URL, Domain only, or RegEx Pattern)
    - Edit RegEx patterns for more precise matching
    - Delete tabs from the pinned list
    - Perform bulk operations (Open All, Close All, Resync)

### Tab Syncing

The extension automatically syncs pinned tabs when:

- The browser starts
- A new window is created
- You click the "Resync Tabs" button

## GitHub Actions

This project uses GitHub Actions for automated builds and releases. When you push a tag starting with `v` (like `v1.0.0`), it will automatically:

1. Build the extension
2. Package it for production
3. Create a GitHub release with the packaged ZIP file attached

To create a new release:

```bash
# Update version in package.json and manifest.json
npm run version 1.0.1

# Commit the changes
git add .
git commit -m "Bump version to 1.0.1"

# Create and push a tag
git tag v1.0.1
git push origin v1.0.1
```

The GitHub Actions workflow will then create a new release with the packaged extension.

## License

MIT 