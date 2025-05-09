const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const {execSync} = require('child_process');

// Check for --production flag
const isProduction = process.argv.includes('--production');
const sourceDir = isProduction ? 'dist-prod' : 'dist';

// Get version from package.json
const packageJson = require('../package.json');
const version = packageJson.version;

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, '..', 'packages');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, {recursive: true});
}

// Create a file to stream archive data to
const filename = `pinned-tabs-v${version}${!isProduction ? '-dev' : ''}.zip`;
const outputPath = path.join(outputDir, filename);
const output = fs.createWriteStream(outputPath);
const archive = archiver('zip', {
    zlib: {level: 9}, // Maximum compression
});

// Listen for all archive data to be written
output.on('close', function () {
    console.log(`Extension packaged successfully: ${outputPath}`);
    console.log(`Total size: ${(archive.pointer() / 1024).toFixed(2)} KB`);
});

// Listen for warnings
archive.on('warning', function (err) {
    if (err.code === 'ENOENT') {
        console.warn('Warning:', err);
    } else {
        throw err;
    }
});

// Listen for errors
archive.on('error', function (err) {
    throw err;
});

// Pipe archive data to the file
archive.pipe(output);

// Add the dist directory contents to the ZIP
archive.directory(sourceDir + '/', false, {name: 'Pinned Tabs'});

// Finalize the archive (i.e., finish packaging)
archive.finalize().then(
    () => {
        fs.rmSync(sourceDir, {recursive: true, force: true});
    },
);