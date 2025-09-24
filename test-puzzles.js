#!/usr/bin/env node
/**
 * Comprehensive Sudoku Puzzle Test Suite
 * 
 * This script provides automated testing for all Sudoku puzzles.
 * Run with: node test-puzzles.js
 * 
 * Features:
 * - Validates all existing puzzles
 * - Generates new puzzles if needed
 * - Creates detailed test reports
 * - Provides performance metrics
 */

const { validatePuzzle, generatePuzzle, PUZZLES } = require('./puzzle-validator');
const fs = require('fs');
const path = require('path');

/**
 * Test configuration
 */
const CONFIG = {
    generateNewPuzzlesOnFail: true,
    saveDetailedReports: true,
    reportsDir: './test-reports',
    expectedPuzzleCounts: {
        beginner: 15,
        easy: 15,
        medium: 15,
        hard: 15
    }
};

/**
 * Main test suite
 */
class SudokuTestSuite {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            totalTests: 0,
            passedTests: 0,
            failedTests: 0,
            warnings: 0,
            details: {}
        };
    }

    /**
     * Run all tests
     */
    async runAllTests() {
        console.log('🧩 Sudoku Puzzle Test Suite');
        console.log('=' .repeat(60));
        console.log(`Started at: ${new Date().toLocaleString()}`);
        console.log('');

        // Ensure reports directory exists
        if (CONFIG.saveDetailedReports && !fs.existsSync(CONFIG.reportsDir)) {
            fs.mkdirSync(CONFIG.reportsDir, { recursive: true });
        }

        // Test 1: Validate puzzle structure
        await this.testPuzzleStructure();

        // Test 2: Validate individual puzzles
        await this.testIndividualPuzzles();

        // Test 3: Test difficulty progression
        await this.testDifficultyProgression();

        // Test 4: Performance tests
        await this.testPerformance();

        // Generate report
        this.generateReport();

        return this.results.failedTests === 0;
    }

    /**
     * Test puzzle structure and counts
     */
    async testPuzzleStructure() {
        console.log('📊 Testing puzzle structure...');
        
        for (const [difficulty, expectedCount] of Object.entries(CONFIG.expectedPuzzleCounts)) {
            const actualCount = PUZZLES[difficulty] ? PUZZLES[difficulty].length : 0;
            
            if (actualCount !== expectedCount) {
                this.addFailure('structure', `${difficulty}: expected ${expectedCount} puzzles, found ${actualCount}`);
            } else {
                this.addSuccess('structure', `${difficulty}: ${actualCount} puzzles ✓`);
            }
        }
        
        console.log('');
    }

    /**
     * Validate each individual puzzle
     */
    async testIndividualPuzzles() {
        console.log('🔍 Testing individual puzzles...');
        
        for (const [difficulty, puzzleList] of Object.entries(PUZZLES)) {
            console.log(`\nTesting ${difficulty} puzzles:`);
            
            puzzleList.forEach((puzzle, index) => {
                const testName = `${difficulty}-${index + 1}`;
                const validation = validatePuzzle(puzzle.givens, puzzle.solution);
                
                if (validation.isValid) {
                    this.addSuccess(testName, 'Valid puzzle');
                    console.log(`  ✅ ${difficulty} #${index + 1}: Valid`);
                    
                    if (validation.warnings.length > 0) {
                        validation.warnings.forEach(warning => {
                            this.addWarning(testName, warning);
                            console.log(`     ⚠️  ${warning}`);
                        });
                    }
                } else {
                    this.addFailure(testName, validation.errors.join('; '));
                    console.log(`  ❌ ${difficulty} #${index + 1}: Invalid`);
                    validation.errors.forEach(error => {
                        console.log(`     • ${error}`);
                    });
                }
            });
        }
        
        console.log('');
    }

    /**
     * Test difficulty progression
     */
    async testDifficultyProgression() {
        console.log('📈 Testing difficulty progression...');
        
        const difficultyStats = {};
        
        for (const [difficulty, puzzleList] of Object.entries(PUZZLES)) {
            const givenCounts = puzzleList.map(puzzle => {
                return puzzle.givens.split('').filter(c => c !== '0').length;
            });
            
            const avgGivens = givenCounts.reduce((a, b) => a + b, 0) / givenCounts.length;
            const minGivens = Math.min(...givenCounts);
            const maxGivens = Math.max(...givenCounts);
            
            difficultyStats[difficulty] = {
                average: avgGivens.toFixed(1),
                min: minGivens,
                max: maxGivens,
                range: `${minGivens}-${maxGivens}`
            };
            
            console.log(`  ${difficulty}: ${avgGivens.toFixed(1)} givens on average (${minGivens}-${maxGivens})`);
        }
        
        // Check progression logic
        const difficulties = ['beginner', 'easy', 'medium', 'hard'];
        for (let i = 0; i < difficulties.length - 1; i++) {
            const current = difficulties[i];
            const next = difficulties[i + 1];
            
            if (difficultyStats[current] && difficultyStats[next]) {
                const currentAvg = parseFloat(difficultyStats[current].average);
                const nextAvg = parseFloat(difficultyStats[next].average);
                
                if (currentAvg <= nextAvg) {
                    this.addFailure('progression', `${current} (${currentAvg}) should have more givens than ${next} (${nextAvg})`);
                } else {
                    this.addSuccess('progression', `${current} → ${next}: difficulty increases ✓`);
                }
            }
        }
        
        console.log('');
    }

    /**
     * Performance tests
     */
    async testPerformance() {
        console.log('⚡ Testing performance...');
        
        const startTime = Date.now();
        let validationCount = 0;
        
        for (const [difficulty, puzzleList] of Object.entries(PUZZLES)) {
            puzzleList.forEach(puzzle => {
                validatePuzzle(puzzle.givens, puzzle.solution);
                validationCount++;
            });
        }
        
        const endTime = Date.now();
        const totalTime = endTime - startTime;
        const avgTime = totalTime / validationCount;
        
        console.log(`  Validated ${validationCount} puzzles in ${totalTime}ms`);
        console.log(`  Average validation time: ${avgTime.toFixed(2)}ms per puzzle`);
        
        if (avgTime > 100) {
            this.addWarning('performance', `Slow validation: ${avgTime.toFixed(2)}ms per puzzle`);
        } else {
            this.addSuccess('performance', `Good validation speed: ${avgTime.toFixed(2)}ms per puzzle`);
        }
        
        console.log('');
    }

    /**
     * Add successful test result
     */
    addSuccess(category, message) {
        this.results.totalTests++;
        this.results.passedTests++;
        
        if (!this.results.details[category]) {
            this.results.details[category] = { passed: [], failed: [], warnings: [] };
        }
        this.results.details[category].passed.push(message);
    }

    /**
     * Add failed test result
     */
    addFailure(category, message) {
        this.results.totalTests++;
        this.results.failedTests++;
        
        if (!this.results.details[category]) {
            this.results.details[category] = { passed: [], failed: [], warnings: [] };
        }
        this.results.details[category].failed.push(message);
    }

    /**
     * Add warning
     */
    addWarning(category, message) {
        this.results.warnings++;
        
        if (!this.results.details[category]) {
            this.results.details[category] = { passed: [], failed: [], warnings: [] };
        }
        this.results.details[category].warnings.push(message);
    }

    /**
     * Generate final test report
     */
    generateReport() {
        const success = this.results.failedTests === 0;
        
        console.log('=' .repeat(60));
        console.log('📊 Test Results Summary');
        console.log('=' .repeat(60));
        console.log(`Total tests: ${this.results.totalTests}`);
        console.log(`Passed: ${this.results.passedTests}`);
        console.log(`Failed: ${this.results.failedTests}`);
        console.log(`Warnings: ${this.results.warnings}`);
        console.log(`Success rate: ${((this.results.passedTests / this.results.totalTests) * 100).toFixed(1)}%`);
        
        if (success) {
            console.log('\n✅ All tests passed! Puzzles are valid and ready to use.');
        } else {
            console.log('\n❌ Some tests failed. Check the details above.');
            
            if (CONFIG.generateNewPuzzlesOnFail) {
                console.log('\n🔄 Attempting to generate replacement puzzles...');
                this.generateReplacementPuzzles();
            }
        }

        // Save detailed report if configured
        if (CONFIG.saveDetailedReports) {
            const reportPath = path.join(CONFIG.reportsDir, `test-report-${Date.now()}.json`);
            fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
            console.log(`\n📄 Detailed report saved to: ${reportPath}`);
        }
    }

    /**
     * Generate replacement puzzles for failed tests
     */
    generateReplacementPuzzles() {
        // This would implement puzzle generation logic
        console.log('🎯 Generating replacement puzzles is available in generate-new-puzzles.js');
        console.log('Run: node generate-new-puzzles.js');
    }
}

// CLI Usage
if (require.main === module) {
    const testSuite = new SudokuTestSuite();
    
    testSuite.runAllTests().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('❌ Test suite failed with error:', error);
        process.exit(1);
    });
}

module.exports = SudokuTestSuite;