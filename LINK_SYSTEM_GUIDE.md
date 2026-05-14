# Project Link Management System

## Overview
This system allows you to manage Figma links for project case study pages without hardcoding them. Links are stored in a public Google Sheet and automatically updated on your project pages.

**Benefits:**
- ✅ Client can update Figma links without developer access
- ✅ Single source of truth (Google Sheet)
- ✅ Links cached in browser localStorage (fast loading)
- ✅ Fallback to hardcoded links if fetch fails
- ✅ Error notifications if sheet is unreachable

---

## Step 1: Set Up Your Google Sheet

### 1.1 Create a new Google Sheet
1. Go to [Google Sheets](https://sheets.google.com)
2. Click "Create" → "Spreadsheet"
3. Name it: `Portfolio Links` (or similar)

### 1.2 Set up the columns
Create these column headers in Row 1:
| A | B | C | D | E |
|---|---|---|---|---|
| Project | Link ID | Link Name | Figma URL | Type |

**Example data:**

| Project | Link ID | Link Name | Figma URL | Type |
|---------|---------|-----------|-----------|------|
| mealwise | welcome | Welcome | `https://www.figma.com/embed?embed_host=share&url=...` | screen |
| mealwise | home | Home | `https://www.figma.com/embed?embed_host=share&url=...` | screen |
| mealwise | recipe-detail | Recipe Detail | `https://www.figma.com/embed?embed_host=share&url=...` | screen |
| mealwise | profile | Profile | `https://www.figma.com/embed?embed_host=share&url=...` | screen |
| mealwise | full-prototype | Full Prototype | `https://www.figma.com/embed?embed_host=share&url=...` | prototype |

### 1.3 Publish the sheet
1. Click "File" → "Share"
2. Click "Publish to web" (bottom right)
3. Select:
   - "Entire document" (dropdown)
   - "Comma-separated values (.csv)" (dropdown)
4. Click "Publish"
5. Copy the published URL

### 1.4 Add the URL to `link-loader.js`
Open `link-loader.js` and replace this line:

```javascript
this.sheetUrl = ""; // TODO: Add your sheet URL here
```

With your published sheet URL:

```javascript
this.sheetUrl = "https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv";
```

---

## Step 2: Create a New Project Page

### 2.1 File structure
```
projects/
├── mealwise.html
├── nextproject.html
└── anotherproject.html
```

Each project is a flat file in the `/projects/` folder.

### 2.2 Template for new project
Copy the structure from `projects/mealwise.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PROJECT_NAME — Case Study · Tsholi Podile</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500&family=Geist:wght@400;500;600&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../style.css">
  <script src="../script.js" defer></script>
  <script src="../link-loader.js" defer></script>
</head>
<body class="case-body">

  <header class="case-nav">
    <a href="../index.html" class="back">
      <span class="arrow" aria-hidden="true">←</span>
      Back to work
    </a>
    <span class="case-title">PROJECT_NAME</span>
    <span class="nav-status">
      <span class="status-dot" aria-hidden="true"></span>
      <span>Case study · YEAR</span>
    </span>
  </header>

  <main class="case-container">
    <!-- Your case study content -->
    
    <!-- IMPORTANT: Use data attributes on iframes -->
    <div class="embed-card">
      <div class="phone-frame">
        <iframe 
          data-project="projectname" 
          data-link-id="unique-link-id"
          src="FALLBACK_FIGMA_URL" 
          allowfullscreen>
        </iframe>
      </div>
      <p class="embed-caption"><b>01</b> Screen Name</p>
    </div>
  </main>

  <footer class="footer">
    <a href="../index.html" class="back-to-top">© 2026 Tsholi Podile</a>
    <a href="#" class="back-to-top">Next case study — soon <span aria-hidden="true">→</span></a>
  </footer>

</body>
</html>
```

### 2.3 Key points for new pages:

1. **`<script src="../link-loader.js" defer></script>`** — Must be included
2. **Asset paths** — Use `../` prefix (e.g., `../style.css`, `../index.html`)
3. **Data attributes on iframes:**
   ```html
   <iframe 
     data-project="projectname"    <!-- lowercase, matches Google Sheet -->
     data-link-id="unique-id"       <!-- matches Column B in sheet -->
     src="FALLBACK_URL"             <!-- hardcoded backup -->
     allowfullscreen>
   </iframe>
   ```

### 2.4 Naming conventions:
- **Project name** (Column A): lowercase, no spaces (e.g., `mealwise`, `projectx`)
- **Link ID** (Column B): lowercase with hyphens (e.g., `welcome`, `full-prototype`)
- **File name**: `projects/projectname.html`

---

## Step 3: Update index.html

Add a link to your new project in the work section:

```html
<a href="projects/newproject.html" class="work-card reveal">
  <!-- ... -->
</a>
```

---

## How It Works

### On page load:
1. JavaScript checks Google Sheet URL (in `link-loader.js`)
2. Fetches CSV from published sheet
3. Parses data and looks for iframes matching the project name
4. Updates iframe `src` attributes with live links
5. Caches result in localStorage for 24 hours
6. Falls back to hardcoded URLs if fetch fails
7. Shows error notification if needed

### Updating links:
Client simply:
1. Opens Google Sheet
2. Updates a Figma URL in the appropriate row
3. Refreshes the website
4. New link loads automatically (localStorage expires in 24h, or manually clear cache)

---

## Troubleshooting

### Links not updating?
1. Check `link-loader.js` has correct Google Sheet URL
2. Verify sheet is published to web
3. Check data attributes match (case-sensitive):
   - `data-project="mealwise"` ← must match Column A
   - `data-link-id="welcome"` ← must match Column B
4. Open DevTools (F12) → Console for error messages

### Error notification appearing?
This means the Google Sheet fetch failed. Reasons:
- Google Sheet URL not set in `link-loader.js`
- Sheet not published to web
- Network connectivity issue
- CORS issue (unlikely with Google Sheets)

**Solution:** Make sure hardcoded `src` attributes are filled in as fallback

### Want to force refresh?
Clear browser localStorage:
1. DevTools → Application → Local Storage → Clear all
2. Refresh page
3. Links will re-fetch from sheet

---

## File Paths Reference

| File | Purpose | Path in HTML |
|------|---------|--------------|
| style.css | Main styles | `../style.css` |
| script.js | Main JS | `../script.js` |
| link-loader.js | Link fetcher | `../link-loader.js` |
| index.html | Homepage | `../index.html` |
| assets/ | Images, icons | `../assets/` |

---

## Example: Adding MealWise v2.0 with new links

### 1. Update Google Sheet:
Add new rows:
```
mealwise-v2 | welcome-v2 | Welcome (v2) | https://figma.com/... | screen
mealwise-v2 | home-v2 | Home (v2) | https://figma.com/... | screen
```

### 2. Create `projects/mealwise-v2.html`
Copy `mealwise.html`, change iframes to:
```html
<iframe 
  data-project="mealwise-v2"
  data-link-id="welcome-v2"
  src="FALLBACK"
  allowfullscreen>
</iframe>
```

### 3. Link from index.html
```html
<a href="projects/mealwise-v2.html" class="work-card reveal">
  <!-- ... -->
</a>
```

Done! Links will auto-fetch from Google Sheet.

---

## Advanced: Multiple projects with same screen names

If you have many projects with similar screen names, use unique Link IDs:

```
mealwise   | welcome       | Welcome Screen
mealwise   | onboarding    | Onboarding
project2   | welcome       | Welcome Screen (different design)
project2   | dashboard     | Dashboard
```

Or use hierarchical IDs:
```
mealwise      | mealwise-welcome
project2      | project2-welcome
```

---

## Quick Checklist for New Projects

- [ ] Google Sheet set up with project data
- [ ] `link-loader.js` has correct sheet URL
- [ ] Created `projects/projectname.html`
- [ ] All iframes have `data-project` and `data-link-id`
- [ ] All hardcoded `src` attributes are filled in
- [ ] Linked project from `index.html`
- [ ] Updated file paths to use `../`
- [ ] Tested on homepage and project page

