#!/usr/bin/env node

/**
 * Simple script to randomize answer order in quiz JSON files
 * Uses line-by-line processing to handle JSON files with formatting issues
 */

const fs = require('fs');

/**
 * Fisher-Yates shuffle algorithm
 */
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Processes a single JSON file using regex replacement
 */
function processJsonFile(filePath) {
    try {
        console.log(`Processing: ${filePath}`);

        // Read the file
        let content = fs.readFileSync(filePath, 'utf8');

        // Parse the JSON
        const questions = JSON.parse(content);

        // Randomize each question
        const randomizedQuestions = questions.map(question => {
            const { options, correctIndex } = question;

            // Create array of indices to track the shuffle
            const indices = Array.from({ length: options.length }, (_, i) => i);

            // Shuffle the indices
            const shuffledIndices = shuffleArray(indices);

            // Create new options array based on shuffled indices
            const newOptions = shuffledIndices.map(index => options[index]);

            // Find where the original correct answer ended up
            const newCorrectIndex = shuffledIndices.indexOf(correctIndex);

            return {
                ...question,
                options: newOptions,
                correctIndex: newCorrectIndex
            };
        });

        // Write back to file with proper formatting
        const jsonString = JSON.stringify(randomizedQuestions, null, 2);
        fs.writeFileSync(filePath, jsonString, 'utf8');

        console.log(`✓ Completed: ${filePath}`);

        // Show statistics
        const correctIndices = randomizedQuestions.map(q => q.correctIndex);
        const distribution = correctIndices.reduce((acc, index) => {
            acc[index] = (acc[index] || 0) + 1;
            return acc;
        }, {});

        console.log(`  Answer distribution:`, distribution);

    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);

        // Try to fix common JSON issues and retry
        console.log(`Attempting to fix ${filePath}...`);
        try {
            let content = fs.readFileSync(filePath, 'utf8');

            // Remove trailing commas before closing brackets/braces
            content = content.replace(/,(\s*[}\]])/g, '$1');

            // Write the fixed content back
            fs.writeFileSync(filePath, content, 'utf8');

            // Try processing again
            processJsonFile(filePath);

        } catch (fixError) {
            console.error(`Failed to fix ${filePath}:`, fixError.message);
        }
    }
}

/**
 * Main function
 */
function main() {
    const args = process.argv.slice(2);

    let filesToProcess = [];

    if (args.length === 0 || args.includes('--all')) {
        // Find all JSON files in current directory
        const files = fs.readdirSync('.')
            .filter(file => file.endsWith('.json'))
            .filter(file => !file.includes('package')); // Exclude package.json if present

        filesToProcess = files;
        console.log(`Found ${files.length} JSON files to process`);
    } else {
        filesToProcess = args;
    }

    console.log('Starting answer randomization...\n');

    filesToProcess.forEach(file => {
        if (fs.existsSync(file)) {
            processJsonFile(file);
        } else {
            console.error(`File not found: ${file}`);
        }
        console.log(''); // Empty line for readability
    });

    console.log('Answer randomization completed!');
}

// Run the script
if (require.main === module) {
    main();
}