#!/usr/bin/env node

/**
 * Script to fix JSON files by removing empty strings from options arrays
 */

const fs = require('fs');

/**
 * Fixes a single JSON file by removing empty options
 * @param {string} filePath - Path to the JSON file
 */
function fixJsonFile(filePath) {
    try {
        console.log(`Fixing: ${filePath}`);

        // Read the file
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const questions = JSON.parse(fileContent);

        // Fix each question
        const fixedQuestions = questions.map(question => {
            return {
                ...question,
                options: question.options.filter(option => option.trim() !== '')
            };
        });

        // Write back to file with proper formatting
        const jsonString = JSON.stringify(fixedQuestions, null, 2);
        fs.writeFileSync(filePath, jsonString, 'utf8');

        console.log(`✓ Fixed: ${filePath}`);

    } catch (error) {
        console.error(`Error fixing ${filePath}:`, error.message);
    }
}

/**
 * Main function
 */
function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        // Find all JSON files in current directory
        const files = fs.readdirSync('.')
            .filter(file => file.endsWith('.json'))
            .filter(file => !file.includes('package')); // Exclude package.json if present

        console.log(`Found ${files.length} JSON files to fix`);
        files.forEach(fixJsonFile);
    } else {
        args.forEach(file => {
            if (fs.existsSync(file)) {
                fixJsonFile(file);
            } else {
                console.error(`File not found: ${file}`);
            }
        });
    }

    console.log('JSON fixing completed!');
}

// Run the script
if (require.main === module) {
    main();
}