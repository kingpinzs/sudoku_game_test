/**
 * Generate a complete new set of valid Sudoku puzzles
 * This script will create a new puzzles.js file with valid puzzles
 */

const fs = require('fs');
const { validatePuzzle, generatePuzzle } = require('./puzzle-validator');

/**
 * Generate a complete set of puzzles for all difficulty levels
 */
function generateCompletePuzzleSet() {
    const puzzleSet = {
        beginner: [],
        easy: [],
        medium: [],
        hard: []
    };

    const difficultySettings = {
        beginner: { remove: 30, count: 15 },  // Remove 30 cells (51 given) - easier
        easy: { remove: 40, count: 15 },      // Remove 40 cells (41 given)
        medium: { remove: 50, count: 15 },    // Remove 50 cells (31 given)
        hard: { remove: 60, count: 15 }       // Remove 60 cells (21 given) - harder
    };

    console.log('🎯 Generating complete puzzle set...\n');

    for (const [difficulty, settings] of Object.entries(difficultySettings)) {
        console.log(`Generating ${settings.count} ${difficulty} puzzles (removing ${settings.remove} cells)...`);
        
        let attempts = 0;
        const maxAttempts = settings.count * 10; // Allow multiple attempts
        
        while (puzzleSet[difficulty].length < settings.count && attempts < maxAttempts) {
            attempts++;
            
            try {
                const puzzle = generatePuzzle(settings.remove);
                const validation = validatePuzzle(puzzle.givens, puzzle.solution);
                
                if (validation.isValid) {
                    puzzleSet[difficulty].push(puzzle);
                    console.log(`✅ Generated ${difficulty} puzzle #${puzzleSet[difficulty].length}`);
                } else {
                    console.log(`❌ Invalid puzzle generated for ${difficulty} (attempt ${attempts})`);
                }
            } catch (error) {
                console.log(`❌ Error generating ${difficulty} puzzle (attempt ${attempts}): ${error.message}`);
            }
        }
        
        if (puzzleSet[difficulty].length < settings.count) {
            console.log(`⚠️ Only generated ${puzzleSet[difficulty].length}/${settings.count} ${difficulty} puzzles`);
        }
        console.log('');
    }

    return puzzleSet;
}

/**
 * Write puzzles to the puzzles.js file
 */
function writePuzzlesToFile(puzzles) {
    let content = 'const PUZZLES = {\n';
    
    for (const [difficulty, puzzleList] of Object.entries(puzzles)) {
        const count = puzzleList.length;
        content += `  // ${count} ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Puzzles\n`;
        content += `  ${difficulty}: [\n`;
        
        puzzleList.forEach((puzzle, index) => {
            const isLast = index === puzzleList.length - 1;
            content += `    { givens: "${puzzle.givens}", solution: "${puzzle.solution}" }${isLast ? '' : ','}\n`;
        });
        
        content += '  ]';
        
        // Add comma unless it's the last difficulty
        const difficulties = Object.keys(puzzles);
        const isLastDifficulty = difficulty === difficulties[difficulties.length - 1];
        content += isLastDifficulty ? '\n' : ',\n\n';
    }
    
    content += '};\n';
    
    fs.writeFileSync('puzzles.js', content, 'utf8');
    console.log('📝 Wrote new puzzles to puzzles.js');
}

/**
 * Validate the generated puzzle set
 */
function validatePuzzleSet(puzzles) {
    console.log('\n🔍 Validating generated puzzle set...\n');
    
    let totalPuzzles = 0;
    let validPuzzles = 0;
    
    for (const [difficulty, puzzleList] of Object.entries(puzzles)) {
        console.log(`Testing ${puzzleList.length} ${difficulty} puzzles:`);
        
        puzzleList.forEach((puzzle, index) => {
            totalPuzzles++;
            const validation = validatePuzzle(puzzle.givens, puzzle.solution);
            
            if (validation.isValid) {
                validPuzzles++;
                console.log(`✅ ${difficulty} #${index + 1}: Valid`);
            } else {
                console.log(`❌ ${difficulty} #${index + 1}: Invalid`);
                validation.errors.forEach(error => console.log(`   • ${error}`));
            }
        });
        console.log('');
    }
    
    console.log(`📊 Summary: ${validPuzzles}/${totalPuzzles} puzzles are valid`);
    return validPuzzles === totalPuzzles;
}

/**
 * Create a backup of the original puzzles file
 */
function backupOriginalPuzzles() {
    try {
        if (fs.existsSync('puzzles.js')) {
            fs.copyFileSync('puzzles.js', 'puzzles-backup.js');
            console.log('📋 Created backup: puzzles-backup.js');
        }
    } catch (error) {
        console.log('⚠️ Could not create backup:', error.message);
    }
}

// Main execution
if (require.main === module) {
    console.log('🧩 Sudoku Puzzle Generator');
    console.log('=' .repeat(50));
    
    // Create backup
    backupOriginalPuzzles();
    
    // Generate new puzzle set
    const puzzles = generateCompletePuzzleSet();
    
    // Validate the generated puzzles
    const allValid = validatePuzzleSet(puzzles);
    
    if (allValid) {
        // Write to file
        writePuzzlesToFile(puzzles);
        console.log('\n✅ Successfully generated and saved new puzzle set!');
    } else {
        console.log('\n❌ Some generated puzzles are invalid. Please check and retry.');
    }
}

module.exports = {
    generateCompletePuzzleSet,
    writePuzzlesToFile,
    validatePuzzleSet
};