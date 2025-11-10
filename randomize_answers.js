#!/usr/bin/env node

/**
 * Script to randomize answer order in quiz JSON files
 *
 * This script shuffles the order of answer options while maintaining
 * the correct answer by updating the correctIndex accordingly.
 */

const fs = require('fs');
const path = require('path');

/**
 * Fisher-Yates shuffle algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array
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
 * Randomizes the order of answer options for a single question
 * @param {Object} question - Question object
 * @returns {Object} Question with shuffled options
 */
function randomizeQuestionAnswers(question) {
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
}

/**
 * Processes a single JSON file
 * @param {string} filePath - Path to the JSON file
 */
function processJsonFile(filePath) {
    try {
        console.log(`Processing: ${filePath}`);

        // Read the file
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const questions = JSON.parse(fileContent);

        // Randomize each question
        const randomizedQuestions = questions.map(question => {
            return randomizeQuestionAnswers(question);
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
    }
}

/**
 * Main function
 */
function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.log('Usage: node randomize_answers.js <file1.json> [file2.json] ... [--all]');
        console.log('');
        console.log('Options:');
        console.log('  --all    Process all JSON files in current directory');
        console.log('');
        console.log('Examples:');
        console.log('  node randomize_answers.js anatomia.json');
        console.log('  node randomize_answers.js anatomia.json embrio.json');
        console.log('  node randomize_answers.js --all');
        return;
    }

    let filesToProcess = [];

    if (args.includes('--all')) {
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

module.exports = {
    shuffleArray,
    randomizeQuestionAnswers,
    processJsonFile
};