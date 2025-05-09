const fs = require('fs');
const path = require('path');

// Files to be removed after reorganization
const foldersToRemove = [
    'dist',
    'packages',
    'dist-prod',
];

console.log('Cleaning up build files if they exist...');

foldersToRemove.forEach(folder => {
    const folderPath = path.resolve(__dirname, '..', folder);

    if (fs.existsSync(folderPath)) {
        fs.rmSync(folderPath, {recursive: true, force: true});
        console.log(`Removed ${folderPath}`);
    } else {
        console.log(`${folderPath} does not exist`);
    }
});

console.log('Cleanup complete!'); 