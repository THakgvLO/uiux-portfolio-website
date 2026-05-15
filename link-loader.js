/**
 * Link Loader System
 * Fetches Figma links from a published Google Sheet and updates project pages
 * 
 * Google Sheet should be published with this structure:
 * Column A: Project (e.g., "mealwise")
 * Column B: Link ID (e.g., "welcome", "full-prototype")
 * Column C: Link Name (e.g., "Welcome Screen")
 * Column D: Figma URL (full embed URL)
 * Column E: Type (optional: "screen" or "prototype")
 */

class LinkLoader {
  constructor() {
    // IMPORTANT: Replace with your published Google Sheet CSV export URL
    // How to get it:
    // 1. Open your Google Sheet
    // 2. Click Share → Publish to web
    // 3. Select "Entire document" and "Comma-separated values (.csv)"
    // 4. Copy the published link and paste it below.
    this.sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR2HfgX-WgktfaEDzoHkJr50pctpUYb0JyL92Mi5TQ6RLnM-kEISYiD4NKSzU1OYi-GVR8ZI-S1wiQX/pub?output=csv"; // TODO: Add your sheet URL here
    
    this.cacheKey = "figmaLinksCache";
    this.cacheTimestampKey = "figmaLinksCacheTimestamp";
    this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  }

  /**
   * Fetch links from Google Sheet and update page
   */
  async init() {
    // Only fetch if URL is configured
    if (!this.sheetUrl) {
      console.log("Link Loader: Using hardcoded links (no sheet URL configured)");
      return;
    }

    try {
      const links = await this.fetchLinks();
      console.log("Link Loader: Loaded links from Google Sheet");
      this.updatePageLinks(links);
    } catch (error) {
      console.error("Link Loader: Error fetching links -", error);
      console.log("Link Loader: Using hardcoded fallback links");
      this.showErrorNotification();
      // Page will use hardcoded fallback links
    }
  }

  /**
   * Fetch and parse CSV from Google Sheet
   */
  async fetchLinks() {
    // Check if we have cached data that's still fresh
    const cachedData = this.getCachedLinks();
    if (cachedData) {
      return cachedData;
    }

    // Fetch from Google Sheet
    const response = await fetch(this.sheetUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const csvText = await response.text();
    const links = this.parseCSV(csvText);
    
    // Cache the data
    this.cacheLinks(links);
    
    return links;
  }

  /**
   * Parse CSV into structured object
   * Expected format:
   * Project,Link ID,Link Name,Figma URL,Type
   */
  parseCSV(csvText) {
    const lines = csvText.trim().split("\n");
    const links = {};

    // Skip header row (first line)
    for (let i = 1; i < lines.length; i++) {
      const [project, linkId, linkName, figmaUrl, type] = this.parseCSVLine(lines[i]);
      
      if (!project || !linkId || !figmaUrl) {
        continue; // Skip incomplete rows
      }

      const projectKey = project.trim().toLowerCase();
      const linkKey = linkId.trim().toLowerCase();
      const normalizedUrl = this.normalizeFigmaUrl(figmaUrl);

      if (!links[projectKey]) {
        links[projectKey] = {};
      }

      links[projectKey][linkKey] = {
        name: linkName || linkKey,
        url: normalizedUrl,
        type: (type || "screen").trim().toLowerCase()
      };
    }

    return links;
  }

  normalizeFigmaUrl(url) {
    const value = url.trim();
    if (!value) {
      return value;
    }

    // If it's already an embed URL, use it directly.
    if (value.includes("/embed?embed_host=share&url=")) {
      return value;
    }

    // Convert the normal Figma design/proto/deck URL into an embed URL.
    if (value.startsWith("https://www.figma.com/")) {
      return `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(value)}`;
    }

    return value;
  }

  /**
   * Parse a single CSV line (handles quoted values)
   */
  parseCSVLine(line) {
    const result = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  /**
   * Update all iframes with fetched links
   */
  updatePageLinks(links) {
    // Get all iframes with data-project attribute
    const iframes = document.querySelectorAll("iframe[data-project][data-link-id]");

    iframes.forEach((iframe) => {
      const project = iframe.getAttribute("data-project");
      const linkId = iframe.getAttribute("data-link-id");
      const projectKey = project ? project.trim().toLowerCase() : "";
      const linkKey = linkId ? linkId.trim().toLowerCase() : "";

      if (links[projectKey] && links[projectKey][linkKey]) {
        const newUrl = links[projectKey][linkKey].url;
        console.log(`Link Loader: Updated ${projectKey}/${linkKey} from sheet`);
        iframe.src = newUrl;
      } else {
        console.log(`Link Loader: Using hardcoded fallback for ${projectKey}/${linkKey}`);
      }
    });
  }

  /**
   * Get cached links if still fresh
   */
  getCachedLinks() {
    try {
      const timestamp = localStorage.getItem(this.cacheTimestampKey);
      const cached = localStorage.getItem(this.cacheKey);

      if (!timestamp || !cached) {
        return null;
      }

      const age = Date.now() - parseInt(timestamp);
      if (age > this.cacheExpiry) {
        // Cache expired, remove it
        localStorage.removeItem(this.cacheKey);
        localStorage.removeItem(this.cacheTimestampKey);
        return null;
      }

      return JSON.parse(cached);
    } catch (error) {
      console.error("Link Loader: Error reading cache -", error);
      return null;
    }
  }

  /**
   * Cache links in localStorage
   */
  cacheLinks(links) {
    try {
      localStorage.setItem(this.cacheKey, JSON.stringify(links));
      localStorage.setItem(this.cacheTimestampKey, Date.now().toString());
    } catch (error) {
      console.error("Link Loader: Error caching links -", error);
    }
  }

  /**
   * Show error notification
   */
  showErrorNotification() {
    const notification = document.getElementById("linkErrorNotification");
    if (notification) {
      notification.style.display = "block";
      // Auto-hide after 5 seconds
      setTimeout(() => {
        notification.style.display = "none";
      }, 5000);
    }
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const loader = new LinkLoader();
  loader.init();
});
