const fs = require('fs');

const data = JSON.parse(fs.readFileSync('scratch/stats.json', 'utf8'));

let results = [];
function traverse(node, path = '') {
    if (node.gzipLength) {
        results.push({
            name: path + node.name,
            size: node.renderedLength,
            gzipSize: node.gzipLength
        });
    }
    if (node.children) {
        for (const child of node.children) {
            traverse(child, path + (node.name ? node.name + '/' : ''));
        }
    }
}

traverse(data);

// Sort by size
results.sort((a, b) => b.size - a.size);

// Print top 20
console.log("MODULE | RAW SIZE | GZIP SIZE");
for (const r of results.slice(0, 20)) {
    console.log(`${r.name} | ${(r.size/1024).toFixed(2)} KB | ${(r.gzipSize/1024).toFixed(2)} KB`);
}

let vendorSize = 0;
let srcSize = 0;
for (const r of results) {
    if (r.name.includes('node_modules')) vendorSize += r.size;
    else srcSize += r.size;
}
console.log(`\nTotal node_modules raw: ${(vendorSize/1024).toFixed(2)} KB`);
console.log(`Total src raw: ${(srcSize/1024).toFixed(2)} KB`);
