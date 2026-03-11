# SmartVahaan Logo Integration Guide

## 📍 Logo File Locations

Your logo files are stored in the `public` folder of the frontend:

```text
c:\smartvahan\frontend\public\
├── logo.svg           (General logo - 200x200px)
├── logo-light.svg     (Light mode logo - for light theme)
└── logo-dark.svg      (Dark mode logo - for dark theme)
```

## 🎨 Logo Requirements

### Recommended Specifications

- **Format**: SVG (vector) preferred, or PNG/JPG
- **Size**: 200x200 pixels (square)
- **Background**: Transparent for best results
- **File Size**: Keep under 50KB for fast loading

### Theme Variants

1. **logo-light.svg**: Used in light mode (should have dark/colored design)
2. **logo-dark.svg**: Used in dark mode (should have light/white design)
3. **logo.svg**: General fallback logo

## 🔄 How to Replace Logos

### Option 1: Replace SVG files directly

1. Navigate to: `c:\smartvahan\frontend\public\`
2. Replace the placeholder SVG files with your actual logos
3. Keep the same filenames: `logo.svg`, `logo-light.svg`, `logo-dark.svg`
4. Refresh your browser to see the changes

### Option 2: Use PNG/JPG images

If you have PNG or JPG logos instead of SVG:

1. Save your logos as:
   - `logo-light.png` (for light mode)
   - `logo-dark.png` (for dark mode)

2. Update the image references in code:
   - Open `c:\smartvahan\frontend\src\components\Navbar.jsx`
   - Change: `"/logo-dark.svg"` → `"/logo-dark.png"`
   - Change: `"/logo-light.svg"` → `"/logo-light.png"`
   - Repeat for `Login.jsx` and `Sidebar.jsx`

## 📐 Logo Usage in App

Your logo appears in 3 locations:

### 1. Login Page (Left Panel)

- **File**: `c:\smartvahan\frontend\src\pages\Login.jsx`
- **Size**: 120x120 pixels
- **Location**: Line 35-39 (img tag)

### 2. Navbar (Top Bar)

- **File**: `c:\smartvahan\frontend\src\components\Navbar.jsx`
- **Size**: 36x36 pixels
- **Location**: Line 21-26 (img tag)

### 3. Sidebar (Left Navigation)

- **File**: `c:\smartvahan\frontend\src\components\Sidebar.jsx`
- **Size**: 50x50 pixels (circular)
- **Location**: Line 50-55 (img tag)

## 🎯 Current Placeholder Logo

The placeholder logos currently show:

- Black/gray circular background
- White "SV" text
- Simple car icon at the top

## ✅ Testing Your Logo

After adding your logo files:

1. **Clear browser cache**: Ctrl + Shift + R (Windows/Linux) or Cmd + Shift + R (Mac)
2. **Check theme switching**: Toggle between light and dark mode to see both variants
3. **Test responsive design**: Verify logo appears correctly on mobile views
4. **Check all pages**: Login, Dashboard, and all authenticated pages

## 🎨 Design Tips

### For Best Results

- Use vector SVG format for scalability
- Ensure logo is readable at small sizes (36px)
- Provide good contrast for both light and dark themes
- Keep design simple and recognizable
- Test on both mobile and desktop

### Color Recommendations

- **Light Mode Logo**: Use dark colors (black, dark blue, etc.)
- **Dark Mode Logo**: Use light colors (white, light gray, etc.)
- Avoid pure black (#000) and pure white (#fff) for better aesthetics

## 🚀 Quick Start

**To add your logo right now:**

1. Save your logo files in `c:\smartvahan\frontend\public\`
2. Name them `logo-light.svg` and `logo-dark.svg`
3. Refresh the browser (Ctrl + Shift + R)
4. Your logo should appear immediately!

## 📞 Path Reference

**Full paths for logo files:**

```text
c:\smartvahan\frontend\public\logo.svg
c:\smartvahan\frontend\public\logo-light.svg
c:\smartvahan\frontend\public\logo-dark.svg
```

**Access in browser:**

```text
http://localhost:5173/logo.svg
http://localhost:5173/logo-light.svg
http://localhost:5173/logo-dark.svg
```

---

**Note**: The logos are theme-aware and will automatically switch between light and dark variants based on the user's theme preference!
