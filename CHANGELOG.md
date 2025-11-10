# Changelog - Quiz Application

## 2025-10-07 - Major Update: File Organization & Image Support

### Summary
Complete reorganization of project structure and addition of optional image support for questions (particularly for ECG questions in Cardiology).

---

### 1. File Structure Reorganization

#### Changes Made
- Created new folder structure following `folder-organize.md` specifications
- Organized all files under `subjects/` directory with specialty-based hierarchy

#### New Structure
```
subjects/
├── GO/
│   ├── GOQuestions/     (6 JSON files)
│   │   ├── anatomia.json
│   │   ├── ciclo_menstrual.json
│   │   ├── desenvolvimento_puberal.json
│   │   ├── embrio.json
│   │   ├── embrio2.json
│   │   └── exame_ginecologico.json
│   ├── GOImages/        (for future image questions)
│   ├── GOGuias/         (4 markdown files from "GO Conteudo")
│   └── GOResumos/       (4 markdown files from "GO Conteudo")
└── CardioPneumo/
    ├── CardioPneumoQuestions/  (9 JSON files)
    │   ├── bronquite.json
    │   ├── diagnostico_dpoc.json
    │   ├── dislipidemias.json
    │   ├── enfisema.json
    │   ├── has.json
    │   ├── IC.json
    │   ├── propedeutica.json
    │   ├── SCA.json
    │   └── tratamento_dpoc.json
    ├── CardioPneumoImages/     (for ECG images, etc.)
    ├── CardioPneumoGuias/
    └── CardioPneumoResumos/
```

#### Files Modified
- **js/config.js** (lines 27-105): Updated all file paths to point to new `subjects/` folder structure
- Deleted "GO Conteudo" folder after moving contents

---

### 2. Image Support Feature

#### Feature Overview
Added optional image display support for questions without breaking existing questions. Questions can now optionally include images (ECGs, radiographs, diagrams, etc.).

#### Technical Implementation

**HTML Changes** (`index.html` line 164-166):
```html
<div id="question-image-container" class="mb-4 d-none text-center">
    <img id="question-image" src="" alt="Imagem da questão" class="img-fluid question-image">
</div>
```
- Added image container between question text and options
- Hidden by default with `d-none` class

**JavaScript Changes** (`js/app.js` lines 473-483):
```javascript
// Exibe a imagem se existir
const imageContainer = document.getElementById('question-image-container');
const imageElement = document.getElementById('question-image');

if (question.image) {
    imageElement.src = question.image;
    imageContainer.classList.remove('d-none');
} else {
    imageContainer.classList.add('d-none');
    imageElement.src = '';
}
```
- Checks if question has `image` field
- Shows/hides container accordingly
- Gracefully handles questions without images

**CSS Changes** (`css/styles.css` lines 469-490, 756-762):
```css
/* Question Image */
.question-image {
    max-width: 100%;
    max-height: 500px;  /* 300px on mobile */
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
    border: 2px solid rgba(109, 1, 121, 0.2);
    background: white;
    padding: 10px;
    transition: transform 0.3s ease;
}

.question-image:hover {
    transform: scale(1.02);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}
```
- Responsive image sizing
- Styled with shadows, borders, and hover effects
- Matches application design language

#### JSON Format

**Without image (existing questions remain unchanged):**
```json
{
  "question": "Question text",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "correctIndex": 0,
  "explanation": "Explanation text",
  "type": "conteudista"
}
```

**With image (new optional format):**
```json
{
  "question": "Analise o ECG. Qual o diagnóstico?",
  "image": "subjects/CardioPneumo/CardioPneumoImages/ekg1.jpg",
  "options": ["Fibrilação atrial", "Flutter atrial", "..."],
  "correctIndex": 0,
  "explanation": "O ECG mostra ondas f irregulares...",
  "type": "raciocínio"
}
```

**Important:** The `image` field is completely optional. No need to add `"image": ""` to questions without images.

---

### 3. Image Hosting Strategy

#### Confirmed Approach
- **Images hosted on GitHub Pages** directly in the repository
- Place images in specialty-specific folders: `subjects/[Specialty]/[Specialty]Images/`
- Reference using relative paths in JSON
- Supported formats: JPG, PNG, GIF
- No external image hosting required

---

### 4. Question Generation Workflow Discussion

#### Current Workflow (text-based questions)
1. Ask Claude 4.1 to generate prompt for subject/topics
2. Send books/PDFs/PowerPoints to AI (usually NotebookLM)
3. Generate initial questions
4. Use GPT Agent to:
   - Randomize correct answer indices (fix clustering at index 2)
   - Rewrite wrong alternatives to match length/style of correct answers
   - Make distractors more realistic

#### Recommended Workflow for Image-Based Questions
**Key Finding:** NotebookLM is NOT ideal for medical image interpretation (ECGs, radiographs, etc.)

**Better approach:**
1. **For text questions:** Continue using NotebookLM (books/PDFs → questions)
2. **For image questions:** Use Claude 3.5 Sonnet or GPT-4 Vision
   - Upload image directly
   - Ask for quiz question with 4 plausible options
   - These models excel at medical image interpretation
3. **Combine both:** Merge text + image questions
4. **Final step:** GPT Agent for randomization and polishing

**Suggested Prompt for Claude/GPT-4V:**
```
Analyze this [ECG/radiograph/image] and create a medical quiz question. Include:
- Main finding/diagnosis
- 4 options (1 correct, 3 plausible distractors)
- Brief explanation
Format as JSON matching this structure: {...}
```

---

### 5. Documentation Updates

#### README.md Updates
- Added folder structure diagram
- JSON format examples (with/without images)
- New section: "Adicionando Imagens às Questões"
- Updated module addition workflow
- Clear notes about optional `image` field

#### CLAUDE.md Updates
- Updated file structure section
- Question format examples (both types)
- New "Adding Images to Questions" section
- Updated "Adding New Modules" instructions
- Added image support to "Key Features"
- Updated "Common Tasks" with image-related tasks

---

### 6. Future Expansion Capability

The reorganization enables:
- **Easy addition of new specialties:** Just create new folder under `subjects/`
- **Scalable image management:** Each specialty has dedicated Images folder
- **Content organization:** Separate Questions, Images, Guides, Resumos per specialty
- **Clean separation:** Medical specialties logically organized

---

### Files Changed Summary

| File | Changes |
|------|---------|
| `js/config.js` | Updated all file paths to new folder structure |
| `js/app.js` | Added optional image display logic in `displayQuestion()` |
| `index.html` | Added image container in question display area |
| `css/styles.css` | Added image styling with responsive design |
| `README.md` | Complete documentation rewrite with new structure |
| `CLAUDE.md` | Updated technical documentation |

---

### Migration Notes

**Backward Compatibility:** ✅ Fully maintained
- All existing questions work without modification
- No need to add `image` field to existing questions
- Code gracefully handles both formats

**Testing Required:**
- [ ] Test existing questions load correctly from new paths
- [ ] Test question display without images (existing behavior)
- [ ] Test question display with images (new feature)
- [ ] Test on mobile devices (responsive image sizing)
- [ ] Verify GitHub Pages deployment with new structure

---

### Technical Decisions & Rationale

1. **Optional Image Field**
   - Rationale: Avoid overloading NotebookLM prompts with unnecessary fields
   - Implementation: Check for field existence before displaying
   - Benefit: No breaking changes to existing questions

2. **GitHub-Hosted Images**
   - Rationale: Simplicity, no external dependencies
   - Implementation: Relative paths in JSON
   - Benefit: Self-contained deployment

3. **Folder Organization by Specialty**
   - Rationale: Scalability for multiple medical specialties
   - Implementation: `subjects/[Specialty]/[Type]/`
   - Benefit: Clean separation, easy to add new specialties

4. **Separate Images Folder**
   - Rationale: Keep questions and images organized
   - Implementation: `[Specialty]Images/` per specialty
   - Benefit: Easy asset management

---

### Next Steps / Future Considerations

1. **Add sample image question** to test functionality
2. **Create image generation workflow guide** for ECG questions
3. **Consider image optimization** (file size) before committing to repository
4. **Explore image zoom/modal** feature for detailed viewing
5. **Add image alt text guidelines** for accessibility
6. **Document image naming conventions** for consistency

---

### Questions Addressed

**Q: Can images be hosted on GitHub for GitHub Pages?**
A: Yes, images can be stored directly in the repository and served via GitHub Pages.

**Q: How to include images without breaking NotebookLM workflow?**
A: Made `image` field completely optional - questions work with or without it.

**Q: Can NotebookLM interpret ECG images?**
A: No, NotebookLM is weak with medical images. Use Claude 3.5 Sonnet or GPT-4 Vision instead.

**Q: How to handle mixed text and image questions?**
A: Generate separately, then combine and polish with GPT Agent.

---

**End of Update Log**
