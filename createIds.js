const fs = require('fs');

// Function to read the JSON file and return a Promise
function readJSONFile() {
    return new Promise((resolve, reject) => {
        const readStream = fs.createReadStream('../docs/producthunt.json', 'utf8');
        let data = '';

        readStream.on('data', chunk => {
            data += chunk;
        });

        readStream.on('end', () => {
            try {
                const jsonData = JSON.parse(data);
                resolve(jsonData);
            } catch (error) {
                reject(error);
            }
        });

        readStream.on('error', reject);
    });
}

// Function to write the output JSON file and return a Promise
function writeJSONFile(data) {
    return new Promise((resolve, reject) => {
        const outputData = JSON.stringify(data);
        const jsCode = `const phIds = ${outputData};`;
        const writeStream = fs.createWriteStream(`../docs/phId.js`);
        writeStream.write(jsCode, 'utf8');
        writeStream.end();

        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
    });
}

// Read the JSON file and write the output file
readJSONFile()
    .then(jsonData => {
        const phIds = jsonData.map(item => item.phId);
        return writeJSONFile(phIds);
    })
    .then(() => {
        console.log('Output JSON file created successfully!');
    })
    .catch(error => {
        console.error('Error:', error);
    });
