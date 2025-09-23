# Sudoku Game - Mobile Vanilla

Sudoku Game is a pure HTML5/CSS/JavaScript web application that implements a fully functional Sudoku game with multiple difficulty levels, hints, undo functionality, and mobile-optimized interface.

**ALWAYS reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## Working Effectively

### Running the Application
- Start local development server: `python3 -m http.server 8000`
  - Server starts in ~2 seconds. No build process required.
  - Navigate to `http://localhost:8000` to access the game
  - **NEVER CANCEL**: Wait at least 5 seconds for server startup
- Stop server: `pkill -f "python3 -m http.server"` or Ctrl+C

### Project Structure
- `index.html` - Main application file containing all HTML, CSS, and JavaScript (40KB)
- `puzzles.js` - Sudoku puzzle definitions organized by difficulty (12KB)
- No package.json, no build process, no dependencies
- No testing framework or linting tools configured

### Application Features
- **4 Difficulty Levels**: Beginner (guided), Easy, Medium, Hard
- **Game Controls**: New Game, Pause/Resume, Timer, Mistake counter
- **Gameplay Features**: Hints, Undo, Pencil mode, Cell checking
- **Visual Feedback**: Duplicate warnings, row/column/box highlighting
- **Mobile Optimized**: Responsive design with touch-friendly controls

## Validation Scenarios

### Always Test Complete User Workflows
When making changes to the application, **ALWAYS** run through these validation scenarios:

1. **Basic Gameplay Flow**:
   - Start server: `python3 -m http.server 8000`
   - Open `http://localhost:8000` in browser
   - Click "New Game" to generate fresh puzzle
   - Select an empty cell, enter a number (1-9)
   - Verify cell updates and feedback appears
   - Test "Clear" button to remove entries

2. **Difficulty Mode Testing**:
   - Change difficulty from dropdown (Beginner → Easy → Medium → Hard)
   - Verify mistake limits change (∞ → ∞ → 3 → 3)
   - Verify puzzle complexity increases (fewer pre-filled numbers)
   - Generate new game and confirm difficulty applies

3. **Feature Validation**:
   - Test "Hint" button (provides location guidance in beginner mode)
   - Test "Undo" button (reverses last move)
   - Test "Pencil" mode (enables note-taking)
   - Test "Check Cell" (validates current selection)
   - Verify timer runs and mistake counter increments

4. **Error Scenario Testing**:
   - Enter duplicate number in same row/column/box
   - Verify duplicate warning appears with visual highlighting
   - Confirm mistake counter increments appropriately

### Screenshot Validation
- Always take screenshots when modifying UI elements
- Game should display 9x9 grid with clear cell borders
- Number pad should show buttons 1-9 plus Clear button
- Header should show timer, mistakes, mode selector, and action buttons

## Common Tasks

### Development Workflow
- **Code Location**: All application logic is in `index.html` (1,238 lines total)
- **Styling**: CSS is embedded in `<style>` tags (lines 7-674) 
- **JavaScript**: All logic in embedded `<script>` tags (lines 675-1238)
- **Puzzle Data**: All puzzles defined in `puzzles.js` PUZZLES object
- **No Build Required**: Direct file editing, refresh browser to see changes

### Key Code Sections
- **JavaScript Start**: Line 675 (utility functions and state management)
- **Puzzle Loading**: Lines 700-737 (loadPuzzle function)
- **Board Rendering**: Lines 741-800 (grid generation and cell updates)
- **Game Logic**: Lines 800-900 (validation, hints, feedback)
- **Event Handlers**: Lines 900-1200 (user interaction handling)
- **Application Logic**: Lines 675-1238 (all JavaScript embedded in HTML)

### Debugging
- Use browser developer tools console for JavaScript debugging
- All game state stored in global `state` object
- Console logs available for button clicks and game events
- No server-side logic or API calls to debug

## Performance & Timing

### Startup Times
- **Server Start**: 2 seconds - Set timeout to 10+ seconds
- **Page Load**: <1 second - immediate in modern browsers
- **New Game Generation**: <100ms - instantaneous
- **UI Interactions**: <50ms - immediate response

### Resource Usage
- **Memory**: <10MB total application size
- **CPU**: Minimal - no complex calculations or animations
- **Network**: Only initial file download, no ongoing requests

## File System Layout

```
.
├── index.html          # Main application (HTML + CSS + JS)
├── puzzles.js          # Puzzle definitions by difficulty
└── .github/
    └── copilot-instructions.md
```

### Common File Operations
- **View application**: `cat index.html | head -50` (first 50 lines)
- **Check puzzle count**: `grep -c "givens:" puzzles.js` (should show 60 total)
- **View CSS styles**: `sed -n '7,674p' index.html` (extract CSS section)
- **View JavaScript**: `sed -n '675,1238p' index.html` (extract JS section)

## No Build Tools or CI/CD

This is a static web application with:
- **No package.json** - No npm dependencies
- **No build process** - Direct file serving
- **No linting configured** - Manual code review only
- **No automated tests** - Manual testing required
- **No CI/CD pipelines** - Direct repository updates

When making changes:
- Edit files directly
- Start local server for testing
- Manually validate all functionality
- No compilation or bundling steps needed