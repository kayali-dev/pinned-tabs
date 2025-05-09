const fs = require('fs');
const path = require('path');

// Get new version from command line
const newVersion = process.argv[2];

if (!newVersion) {
    console.error('Error: Please provide a version number (e.g., node update-version.js 1.0.1)');
    process.exit(1);
}

// Validate version format (simple validation)
if (!/^\d+\.\d+\.\d+$/.test(newVersion)) {
    console.error('Error: Version must be in the format x.y.z (e.g., 1.0.1)');
    process.exit(1);
}

// Update package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const oldVersion = packageJson.version;
packageJson.version = newVersion;

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf8');
console.log(`Updated package.json version: ${oldVersion} → ${newVersion}`);

// Update manifest.json
const manifestJsonPath = path.join(__dirname, '..', 'manifest.json');
const manifestJson = JSON.parse(fs.readFileSync(manifestJsonPath, 'utf8'));
const oldManifestVersion = manifestJson.version;
manifestJson.version = newVersion;

fs.writeFileSync(manifestJsonPath, JSON.stringify(manifestJson, null, 2) + '\n', 'utf8');
console.log(`Updated manifest.json version: ${oldManifestVersion} → ${newVersion}`);

console.log(`\nVersion updated successfully to ${newVersion}`);
console.log('To create a new package with this version, run: npm run package'); 