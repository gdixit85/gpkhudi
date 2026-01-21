# खुडी ग्रामपंचायत वेबसाईट

Khudi Grampanchayat Website - Built with Hugo and Decap CMS

## 🌐 Live Site(Development)

- **Local Development**: http://localhost:1313
- **Production**: https://khudi-gp.pages.dev (after deployment)

## 📁 Project Structure

```
GP Khudi/
├── hugo.toml              # Hugo configuration
├── content/               # All page content (Marathi)
│   ├── _index.md          # Home page
│   ├── about.md           # About page
│   ├── panchayat.md       # Panchayat body
│   └── contact.md         # Contact page
├── layouts/               # HTML templates
│   ├── _default/
│   │   ├── baseof.html    # Base template
│   │   ├── single.html    # Single page
│   │   ├── panchayat.html # Officials page
│   │   └── contact.html   # Contact page
│   ├── index.html         # Home page template
│   └── partials/
│       ├── header.html    # Navigation
│       └── footer.html    # Footer
└── static/
    ├── css/style.css      # Main stylesheet
    ├── images/            # Photos and graphics
    └── admin/             # Decap CMS
        ├── index.html     # CMS entry point
        └── config.yml     # CMS configuration
```

## 🛠️ Development Setup

### Prerequisites

1. **Hugo Extended** (v0.110+)
   ```bash
   # Windows (using winget)
   winget install Hugo.Hugo.Extended
   
   # Or download from: https://gohugo.io/installation/windows/
   ```

2. **Git** (for version control)

### Running Locally

```bash
# Navigate to project folder
cd "GP Khudi"

# Start development server
hugo server -D

# Site available at http://localhost:1313
```

## 🚀 Deployment to Cloudflare Pages

### Step 1: Create GitHub Repository

1. Go to [github.com](https://github.com) and log in
2. Click "New Repository"
3. Name: `khudi-grampanchayat-website`
4. Keep it Public or Private (your choice)
5. Don't initialize with README (we have files already)

### Step 2: Push Code to GitHub

```bash
# In your project folder
cd "c:\Users\Compu Care\Desktop\Projects\GP Khudi"

# Initialize git
git init

# Add all files
git add .

# First commit
git commit -m "Initial commit: Khudi Grampanchayat website"

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/khudi-grampanchayat-website.git

# Push to GitHub
git push -u origin main
```

### Step 3: Connect to Cloudflare Pages

1. Go to [pages.cloudflare.com](https://pages.cloudflare.com)
2. Sign up/Log in with your account
3. Click "Create a project" → "Connect to Git"
4. Select your GitHub repository
5. Configure build settings:
   - **Build command**: `hugo`
   - **Build output directory**: `public`
   - **Environment variable**: `HUGO_VERSION` = `0.153.2`
6. Click "Save and Deploy"

Your site will be live at: `https://khudi-grampanchayat-website.pages.dev`

### Step 4: Add Custom Domain (Optional)

1. In Cloudflare Pages → Your project → Custom domains
2. Add your domain (e.g., `khudigrampanchayat.in`)
3. Follow DNS setup instructions

## 📝 Using Decap CMS (For Officials)

After deployment, officials can edit content at:
`https://your-site.pages.dev/admin/`

### First-Time CMS Setup

1. Go to Cloudflare Pages → Your project → Settings → Enable "Cloudflare Access"
2. Set up authentication (email or identity provider)
3. Update `static/admin/config.yml` backend for production

## 🎨 Customization

### Adding Official Photos

1. Add photos to `static/images/` folder
2. Update `layouts/_default/panchayat.html` to reference them:
   ```html
   <div class="official-photo">
     <img src="/images/sarpanch.jpg" alt="सरपंचांचा फोटो">
   </div>
   ```

### Updating Contact Information

Edit `layouts/_default/contact.html` and replace placeholder text:
- `[कार्यालय क्रमांक भरा]` → Actual phone number
- `[ईमेल पत्ता भरा]` → Actual email

### Changing Colors

Edit `static/css/style.css`:
```css
:root {
  --color-primary: #FF6600;    /* Kesari/Saffron */
  --color-secondary: #0066B3;  /* Blue */
}
```

## 📱 Features

- ✅ Responsive design (mobile-friendly)
- ✅ Maharashtra state colors theme
- ✅ Marathi language (proper Devanagari fonts)
- ✅ Fast loading (static site)
- ✅ SEO optimized
- ✅ Emergency contact numbers
- ✅ Google Maps integration
- ✅ CMS for content updates

## 📄 License

This project is for Khudi Grampanchayat, Devgad, Sindhudurg, Maharashtra.

## 🤝 Support

For technical support, contact the website developer.
