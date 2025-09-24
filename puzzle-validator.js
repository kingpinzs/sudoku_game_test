/**
 * Sudoku Puzzle Validator and Generator
 * 
 * This script validates existing puzzles and generates new valid ones.
 * It can be run with Node.js to test all puzzles in the PUZZLES object.
 */

// Import puzzles data
const fs = require('fs');
const path = require('path');

// Read the puzzles.js file and extract the PUZZLES object
const puzzlesContent = fs.readFileSync(path.join(__dirname, 'puzzles.js'), 'utf8');
// Extract the PUZZLES object using regex
const puzzlesMatch = puzzlesContent.match(/const PUZZLES = ({[\s\S]*?});/);
if (!puzzlesMatch) {
    console.error('Could not extract PUZZLES object from puzzles.js');
    process.exit(1);
}
const PUZZLES = eval('(' + puzzlesMatch[1] + ')');

/**
 * Validate a single Sudoku puzzle
 * @param {string} givens - The initial puzzle state (81 digits)
 * @param {string} solution - The complete solution (81 digits)
 * @returns {Object} Validation result with isValid flag and details
 */
function validatePuzzle(givens, solution) {
    const result = {
        isValid: true,
        errors: [],
        warnings: []
    };

    // Check string lengths
    if (givens.length !== 81) {
        result.isValid = false;
        result.errors.push(`Givens length is ${givens.length}, expected 81`);
    }
    if (solution.length !== 81) {
        result.isValid = false;
        result.errors.push(`Solution length is ${solution.length}, expected 81`);
    }

    // Check if strings contain only digits 0-9
    if (!/^[0-9]{81}$/.test(givens)) {
        result.isValid = false;
        result.errors.push('Givens contains invalid characters (must be 0-9)');
    }
    if (!/^[1-9]{81}$/.test(solution)) {
        result.isValid = false;
        result.errors.push('Solution contains invalid characters (must be 1-9)');
    }

    if (!result.isValid) return result;

    // Convert strings to arrays
    const givensArray = givens.split('').map(n => parseInt(n));
    const solutionArray = solution.split('').map(n => parseInt(n));

    // Check if givens are a subset of solution
    for (let i = 0; i < 81; i++) {
        if (givensArray[i] !== 0 && givensArray[i] !== solutionArray[i]) {
            result.isValid = false;
            result.errors.push(`Given at position ${i} (${givensArray[i]}) doesn't match solution (${solutionArray[i]})`);
        }
    }

    // Validate solution is a complete valid Sudoku
    const solutionValidation = validateSudokuSolution(solutionArray);
    if (!solutionValidation.isValid) {
        result.isValid = false;
        result.errors.push(...solutionValidation.errors);
    }

    // Check if givens alone create valid constraints
    const givensValidation = validatePartialSudoku(givensArray);
    if (!givensValidation.isValid) {
        result.isValid = false;
        result.errors.push(...givensValidation.errors);
    }

    // Check puzzle difficulty (count of given numbers)
    const givenCount = givensArray.filter(n => n !== 0).length;
    if (givenCount < 17) {
        result.warnings.push(`Very few givens (${givenCount}), puzzle might be unsolvable`);
    }
    if (givenCount > 60) {
        result.warnings.push(`Many givens (${givenCount}), puzzle might be too easy`);
    }

    return result;
}

/**
 * Validate a complete Sudoku solution
 * @param {number[]} grid - 81-element array representing the complete grid
 * @returns {Object} Validation result
 */
function validateSudokuSolution(grid) {
    const result = { isValid: true, errors: [] };

    // Check all numbers are 1-9
    for (let i = 0; i < 81; i++) {
        if (grid[i] < 1 || grid[i] > 9) {
            result.isValid = false;
            result.errors.push(`Invalid number ${grid[i]} at position ${i}`);
        }
    }

    if (!result.isValid) return result;

    // Check rows
    for (let row = 0; row < 9; row++) {
        const rowNumbers = [];
        for (let col = 0; col < 9; col++) {
            rowNumbers.push(grid[row * 9 + col]);
        }
        if (!hasAllNumbers(rowNumbers)) {
            result.isValid = false;
            result.errors.push(`Row ${row + 1} is invalid: ${rowNumbers.join(',')}`);
        }
    }

    // Check columns
    for (let col = 0; col < 9; col++) {
        const colNumbers = [];
        for (let row = 0; row < 9; row++) {
            colNumbers.push(grid[row * 9 + col]);
        }
        if (!hasAllNumbers(colNumbers)) {
            result.isValid = false;
            result.errors.push(`Column ${col + 1} is invalid: ${colNumbers.join(',')}`);
        }
    }

    // Check 3x3 boxes
    for (let boxRow = 0; boxRow < 3; boxRow++) {
        for (let boxCol = 0; boxCol < 3; boxCol++) {
            const boxNumbers = [];
            for (let row = boxRow * 3; row < boxRow * 3 + 3; row++) {
                for (let col = boxCol * 3; col < boxCol * 3 + 3; col++) {
                    boxNumbers.push(grid[row * 9 + col]);
                }
            }
            if (!hasAllNumbers(boxNumbers)) {
                result.isValid = false;
                result.errors.push(`Box at (${boxRow + 1},${boxCol + 1}) is invalid: ${boxNumbers.join(',')}`);
            }
        }
    }

    return result;
}

/**
 * Validate a partial Sudoku (with zeros for empty cells)
 * @param {number[]} grid - 81-element array with 0s for empty cells
 * @returns {Object} Validation result
 */
function validatePartialSudoku(grid) {
    const result = { isValid: true, errors: [] };

    // Check rows for duplicates
    for (let row = 0; row < 9; row++) {
        const rowNumbers = [];
        for (let col = 0; col < 9; col++) {
            const num = grid[row * 9 + col];
            if (num !== 0) rowNumbers.push(num);
        }
        if (hasDuplicates(rowNumbers)) {
            result.isValid = false;
            result.errors.push(`Row ${row + 1} has duplicates in givens`);
        }
    }

    // Check columns for duplicates
    for (let col = 0; col < 9; col++) {
        const colNumbers = [];
        for (let row = 0; row < 9; row++) {
            const num = grid[row * 9 + col];
            if (num !== 0) colNumbers.push(num);
        }
        if (hasDuplicates(colNumbers)) {
            result.isValid = false;
            result.errors.push(`Column ${col + 1} has duplicates in givens`);
        }
    }

    // Check 3x3 boxes for duplicates
    for (let boxRow = 0; boxRow < 3; boxRow++) {
        for (let boxCol = 0; boxCol < 3; boxCol++) {
            const boxNumbers = [];
            for (let row = boxRow * 3; row < boxRow * 3 + 3; row++) {
                for (let col = boxCol * 3; col < boxCol * 3 + 3; col++) {
                    const num = grid[row * 9 + col];
                    if (num !== 0) boxNumbers.push(num);
                }
            }
            if (hasDuplicates(boxNumbers)) {
                result.isValid = false;
                result.errors.push(`Box at (${boxRow + 1},${boxCol + 1}) has duplicates in givens`);
            }
        }
    }

    return result;
}

/**
 * Check if array has all numbers 1-9
 */
function hasAllNumbers(arr) {
    const sorted = arr.slice().sort();
    return sorted.join(',') === '1,2,3,4,5,6,7,8,9';
}

/**
 * Check if array has duplicate values
 */
function hasDuplicates(arr) {
    return new Set(arr).size !== arr.length;
}

/**
 * Generate a new valid Sudoku puzzle
 * @param {number} difficulty - Number of cells to remove (higher = harder)
 * @returns {Object} Generated puzzle with givens and solution
 */
function generatePuzzle(difficulty = 40) {
    // Start with a completed valid grid
    const solution = generateCompletedGrid();
    if (!solution) {
        throw new Error('Failed to generate a complete grid');
    }

    // Remove cells to create the puzzle
    const givens = solution.slice(); // Copy solution
    const positions = [];
    for (let i = 0; i < 81; i++) positions.push(i);
    
    // Shuffle positions
    for (let i = positions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [positions[i], positions[j]] = [positions[j], positions[i]];
    }

    // Remove cells
    let removed = 0;
    for (const pos of positions) {
        if (removed >= difficulty) break;
        
        const originalValue = givens[pos];
        givens[pos] = 0;
        
        // Check if puzzle still has unique solution (simplified check)
        if (hasUniqueSolution(givens, solution)) {
            removed++;
        } else {
            givens[pos] = originalValue; // Restore if it breaks uniqueness
        }
    }

    return {
        givens: givens.join(''),
        solution: solution.join('')
    };
}

/**
 * Generate a completed Sudoku grid using backtracking
 * @returns {number[]|null} Complete valid grid or null if failed
 */
function generateCompletedGrid() {
    const grid = new Array(81).fill(0);
    
    if (fillGrid(grid)) {
        return grid;
    }
    return null;
}

/**
 * Fill grid using backtracking algorithm
 */
function fillGrid(grid) {
    for (let i = 0; i < 81; i++) {
        if (grid[i] === 0) {
            const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
            // Shuffle numbers for randomness
            for (let j = numbers.length - 1; j > 0; j--) {
                const k = Math.floor(Math.random() * (j + 1));
                [numbers[j], numbers[k]] = [numbers[k], numbers[j]];
            }
            
            for (const num of numbers) {
                if (isValidPlacement(grid, i, num)) {
                    grid[i] = num;
                    if (fillGrid(grid)) {
                        return true;
                    }
                    grid[i] = 0;
                }
            }
            return false;
        }
    }
    return true;
}

/**
 * Check if placing a number at position is valid
 */
function isValidPlacement(grid, pos, num) {
    const row = Math.floor(pos / 9);
    const col = pos % 9;

    // Check row
    for (let c = 0; c < 9; c++) {
        if (grid[row * 9 + c] === num) return false;
    }

    // Check column
    for (let r = 0; r < 9; r++) {
        if (grid[r * 9 + col] === num) return false;
    }

    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let r = boxRow; r < boxRow + 3; r++) {
        for (let c = boxCol; c < boxCol + 3; c++) {
            if (grid[r * 9 + c] === num) return false;
        }
    }

    return true;
}

/**
 * Simple check if puzzle has unique solution (basic heuristic)
 * This is a simplified version - a full implementation would be more complex
 */
function hasUniqueSolution(givens, expectedSolution) {
    // For now, just check if the givens don't violate basic constraints
    // In a full implementation, we'd solve the puzzle and verify uniqueness
    const validation = validatePartialSudoku(givens);
    return validation.isValid;
}

/**
 * Test all puzzles in the PUZZLES object
 */
function testAllPuzzles() {
    console.log('🔍 Testing all puzzles...\n');
    
    let totalPuzzles = 0;
    let invalidPuzzles = 0;
    let puzzlesWithWarnings = 0;
    
    for (const difficulty in PUZZLES) {
        console.log(`\n📊 Testing ${difficulty} puzzles:`);
        console.log('─'.repeat(50));
        
        PUZZLES[difficulty].forEach((puzzle, index) => {
            totalPuzzles++;
            const result = validatePuzzle(puzzle.givens, puzzle.solution);
            
            if (!result.isValid) {
                invalidPuzzles++;
                console.log(`❌ ${difficulty} #${index + 1}: INVALID`);
                result.errors.forEach(error => console.log(`   • ${error}`));
            } else if (result.warnings.length > 0) {
                puzzlesWithWarnings++;
                console.log(`⚠️  ${difficulty} #${index + 1}: Valid with warnings`);
                result.warnings.forEach(warning => console.log(`   • ${warning}`));
            } else {
                console.log(`✅ ${difficulty} #${index + 1}: Valid`);
            }
        });
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`📈 Summary:`);
    console.log(`Total puzzles tested: ${totalPuzzles}`);
    console.log(`Invalid puzzles: ${invalidPuzzles}`);
    console.log(`Puzzles with warnings: ${puzzlesWithWarnings}`);
    console.log(`Valid puzzles: ${totalPuzzles - invalidPuzzles}`);
    
    if (invalidPuzzles > 0) {
        console.log('\n❌ Some puzzles are invalid and need to be fixed!');
        return false;
    } else {
        console.log('\n✅ All puzzles are valid!');
        return true;
    }
}

/**
 * Generate new puzzles for each difficulty level
 */
function generateNewPuzzles() {
    console.log('\n🎯 Generating new puzzles...\n');
    
    const difficultySettings = {
        beginner: 35,  // Remove 35 cells (46 given)
        easy: 45,      // Remove 45 cells (36 given)
        medium: 50,    // Remove 50 cells (31 given)
        hard: 55       // Remove 55 cells (26 given)
    };
    
    const newPuzzles = {};
    
    for (const [difficulty, removeCount] of Object.entries(difficultySettings)) {
        console.log(`Generating ${difficulty} puzzles (removing ${removeCount} cells)...`);
        newPuzzles[difficulty] = [];
        
        for (let i = 0; i < 5; i++) { // Generate 5 new puzzles per difficulty
            try {
                const puzzle = generatePuzzle(removeCount);
                const validation = validatePuzzle(puzzle.givens, puzzle.solution);
                
                if (validation.isValid) {
                    newPuzzles[difficulty].push(puzzle);
                    console.log(`✅ Generated ${difficulty} puzzle #${i + 1}`);
                } else {
                    console.log(`❌ Failed to generate valid ${difficulty} puzzle #${i + 1}`);
                    i--; // Retry
                }
            } catch (error) {
                console.log(`❌ Error generating ${difficulty} puzzle #${i + 1}: ${error.message}`);
                i--; // Retry
            }
        }
    }
    
    return newPuzzles;
}

// Main execution
if (require.main === module) {
    console.log('🧩 Sudoku Puzzle Validator and Generator');
    console.log('=' .repeat(60));
    
    // Test existing puzzles
    const allValid = testAllPuzzles();
    
    if (!allValid) {
        console.log('\n🔧 Some puzzles need to be fixed. Consider replacing invalid puzzles.');
        
        // Generate replacement puzzles
        const newPuzzles = generateNewPuzzles();
        
        console.log('\n📝 Generated replacement puzzles. You can use these to replace invalid ones.');
        console.log('Check the generated puzzles and manually update puzzles.js as needed.');
    }
}

module.exports = {
    validatePuzzle,
    generatePuzzle,
    testAllPuzzles,
    generateNewPuzzles,
    PUZZLES
};