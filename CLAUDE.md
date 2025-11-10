# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a web-based quiz template application designed for educational purposes. It allows students to take quizzes on different subjects with progress tracking and performance analysis. The application is built with vanilla HTML, CSS, and JavaScript, using Bootstrap for UI components.

## File Structure

```
├── index.html - Main application page with all screens
├── css/
│   └── styles.css - Custom styling for the quiz application
├── js/
│   ├── config.js - Quiz configuration including title, modules, and storage key
│   ├── data.js - Data management layer for questions and user progress
│   └── app.js - Main application logic and UI controls
└── subjects/ - All specialties organized by subject
    ├── GO/
    │   ├── AVC 1/
    │   │   ├── GOQuestions/ - JSON question files for GO AVC 1
    │   │   ├── GOGuias/ - Markdown guide files for AVC 1
    │   │   └── GOResumos/ - Markdown summary files for AVC 1
    │   └── AVC 2/
    │       ├── GOQuestions/ - JSON question files for GO AVC 2
    │       ├── GOGuias/ - Text guide files for AVC 2
    │       └── GOResumos/ - Text summary files for AVC 2
    ├── CardioPneumo/
    │   ├── AVC 1/
    │   │   └── CardioPneumoQuestions/ - JSON question files
    │   └── AVC 2/
    │       └── CardioPneumoQuestions/ - JSON question files
    └── ClinicaCirurgica/
        └── AVC 1/
            └── ClinicaCirurgicaQuestions/ - JSON question files
```

## Architecture

### Configuration System
The application uses a centralized configuration in `js/config.js`:
- `quizConfig.title` - Sets the main quiz title displayed throughout the app
- `quizConfig.storageKey` - Unique localStorage key to prevent conflicts
- `quizConfig.specialties` - Object defining specialties with support for subcategories (AVC 1, AVC 2, etc.)
- Each specialty can have:
  - `hasSubcategories: true` - Enables AVC subcategory selection
  - `subcategories` - Object defining AVC 1, AVC 2, etc. with their modules
  - `modules` - Array of quiz modules for specialties without subcategories
  - `hasResumos` and `hasGuias` - Enables summary and guide buttons

### Data Layer (`js/data.js`)
- **Question Loading**: Dynamically loads question data from JSON files based on module configuration
- **Progress Tracking**: Maintains detailed statistics for each question (seen count, correct/incorrect answers, last seen date)
- **Local Storage**: Automatically saves user progress with auto-save every 10 seconds
- **Module Progress**: Calculates completion percentages based on questions answered correctly at least once

### Application Logic (`js/app.js`)
- **Screen Management**: Single-page app with multiple screens (login, module selection, quiz, results)
- **Quiz Flow**: Questions are presented in original JSON order (no shuffling)
- **Timer**: Tracks time spent on each quiz session
- **Scoring**: Real-time feedback with detailed performance analysis

### Question Format
Each JSON file contains an array of question objects:

**Standard question (without image):**
```json
{
  "question": "Question text",
  "options": ["Option 1", "Option 2", "..."],
  "correctIndex": 0,
  "explanation": "Explanation text",
  "type": "conteudista" | "raciocínio"
}
```

**Question with image (optional):**
```json
{
  "question": "Analyze the ECG. What is the diagnosis?",
  "image": "subjects/CardioPneumo/CardioPneumoImages/ekg1.jpg",
  "options": ["Option 1", "Option 2", "..."],
  "correctIndex": 0,
  "explanation": "Explanation text",
  "type": "raciocínio"
}
```

**Note:** The `image` field is completely optional. Questions without images work exactly as before.

## Development Workflow

### Adding New Modules
1. Create a new JSON file with questions in the appropriate folder (e.g., `subjects/GO/GOQuestions/new_module.json`)
2. Add module configuration to the specialty in `js/config.js`:
   ```javascript
   specialties: {
       go: {
           modules: [
               {
                   id: "new_module",
                   name: "New Module Name",
                   file: "subjects/GO/GOQuestions/new_module"
               }
           ]
       }
   }
   ```
3. The new module will automatically appear in the module selection screen

### Adding Images to Questions
1. Place images in the specialty's Images folder (e.g., `subjects/CardioPneumo/CardioPneumoImages/`)
2. Reference the image in the JSON question using the `image` field (optional)
3. Supported formats: JPG, PNG, GIF
4. Images are hosted on GitHub Pages alongside the application

### Customizing for Different Subjects
1. Update `quizConfig.title` in `js/config.js`
2. Update `quizConfig.storageKey` to prevent localStorage conflicts
3. Replace question JSON files with subject-specific content
4. Optionally update CSS styling in `css/styles.css`

### Testing
- Open `index.html` in a web browser
- Test all quiz flows: login, module selection, quiz completion, results
- Verify progress tracking persists across browser sessions
- Check that all JSON files load correctly

## Key Features
- **Progress Persistence**: User progress automatically saves to localStorage
- **Detailed Analytics**: Tracks question-level statistics and module completion
- **Responsive Design**: Works on desktop and mobile devices
- **Performance Analysis**: Provides feedback based on quiz scores
- **Multi-Module Support**: Easily extensible to support additional quiz modules
- **Multi-Specialty Support**: Organize questions by medical specialties (GO, CardioPneumo, etc.)
- **Image Support**: Optional image display for questions (ECGs, radiographs, diagrams, etc.)
- **Content Organization**: Separate folders for Questions, Images, Guides, and Summaries per specialty

## Repository Information
- **GitHub Repository**: https://github.com/feralog/go1.git
- **Last Update**: GO reorganized into AVC 1 and AVC 2 subcategories with support for guides and summaries. All answer indices randomized across both AVCs.

## Answer Randomization Status
All quiz JSON files have been processed to randomize answer order while maintaining correctness:

### GO - AVC 1:
- **anatomia.json**: ✓ Valid JSON with 20 questions, randomized
- **ciclo_menstrual.json**: ✓ Valid JSON with 20 questions, randomized
- **desenvolvimento_puberal.json**: ✓ Valid JSON with 20 questions, randomized
- **embrio.json**: ✓ Valid JSON with 20 questions, randomized
- **embrio2.json**: ✓ Valid JSON with 20 questions, randomized
- **exame_ginecologico.json**: ✓ Valid JSON with 20 questions, randomized

### GO - AVC 2:
- **1citologia-oncotica.json**: ✓ Valid JSON with 41 questions, randomized
- **3vulvovaginites.json**: ✓ Valid JSON with 39 questions, randomized
- **4istsdipa.json**: ✓ Valid JSON with 39 questions, randomized
- **5patologiastgi.json**: ✓ Valid JSON with 37 questions, randomized
- **6trabalhodepartoeparto.json**: ✓ Valid JSON with 35 questions, randomized

## Common Tasks
- **Change quiz subject**: Edit `quizConfig.title` in `js/config.js`
- **Add questions**: Create new JSON file in appropriate `subjects/[Specialty]/[Specialty]Questions/` folder and add to `quizConfig.specialties` in `js/config.js`
- **Add images to questions**: Place images in `subjects/[Specialty]/[Specialty]Images/` and reference them in JSON with the `image` field (optional)
- **Add new specialty**: Create new folder structure under `subjects/` and add specialty configuration to `quizConfig.specialties`
- **Reset user data**: Use browser developer tools to clear localStorage or call `clearUserData()` function
- **Deploy**: Upload all files to web server - no build process required
- **Randomize answers**: Use the `randomize_simple.js` script if new questions are added