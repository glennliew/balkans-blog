# Reconstructing Communities: Insights from the Balkans

An interactive, immersive blog experience chronicling a student's journey through post-conflict landscapes of Montenegro and Bosnia and Herzegovina. This project explores themes of community reconstruction, architectural memory, and reconciliation through cutting-edge web technologies and compelling storytelling.

## 🌍 Project Overview

This is a 5,000-word interactive blog that takes readers on a journey through three key locations:

- **Budva, Montenegro** - The Periphery's Perspective
- **Mostar, Bosnia and Herzegovina** - The Bridge Between Worlds
- **Sarajevo, Bosnia and Herzegovina** - Architecture for Reconciliation

The experience combines:

- **Academic narrative** about post-conflict reconstruction
- **Interactive Three.js visualizations** for each location
- **Smooth scrolling animations** with GSAP
- **Multimedia placeholders** for photos, audio, and reflections
- **Responsive design** optimized for all devices

## 🏗️ Architecture

### Three Conceptual Sections

1. **Architecture as Witness** - How urban landscapes reflect trauma and history
2. **Erasure of Memory** - How redevelopment can erase or rewrite collective memory
3. **Architecture for Reconciliation** - How reconstruction efforts foster healing and unity

### Technical Stack

- **TypeScript** - Type-safe development with strict configuration
- **Three.js** - 3D visualizations and interactive scenes
- **GSAP** - Smooth animations and scroll-triggered effects
- **Lenis** - Buttery smooth scrolling experience
- **Vite** - Fast development and optimized production builds
- **Modern CSS** - Custom properties, Grid, Flexbox, and responsive design

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. **Clone or download** the project files
2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start development server:**

   ```bash
   npm run dev
   ```

4. **Open your browser** to `http://localhost:3000`

### Production Build

```bash
# Build for production
npm run build

# Serve production build locally
npm run preview

# Serve with http-server
npm run serve
```

## 🎨 Features

### Interactive Elements

- **Dynamic navigation** with progress tracking
- **Three.js scenes** that respond to scroll position
- **Location-specific visualizations** (medieval Budva, bridge Mostar, urban Sarajevo)
- **Multimedia placeholders** ready for user content
- **Section transitions** with visual feedback
- **Responsive design** for all screen sizes

### Content Structure

The blog is organized into distinct sections that flow chronologically and geographically:

1. **Hero Section** - Animated 3D landscape introduction
2. **Introduction** - Theoretical framework and context
3. **Budva** - Coastal Montenegro perspective
4. **Mostar** - Bridge symbolism and destruction/reconstruction
5. **Sarajevo** - Urban reconciliation and memory
6. **Conclusion** - "Living with Scars" reflections

### Typography & Design

- **Primary font:** Inter (modern sans-serif for body text)
- **Secondary font:** Crimson Text (elegant serif for headings)
- **Color scheme:** Blue gradients for Budva, red for Mostar, green for Sarajevo
- **Layout:** Clean, academic style with immersive visual elements

## 📱 Responsive Design

The site is fully responsive across all devices:

- **Desktop** (1200px+): Full layout with side-by-side content
- **Tablet** (768px-1199px): Stacked layout with maintained functionality
- **Mobile** (320px-767px): Optimized for touch interaction

## 🔧 Development

### File Structure

```
balkans-blog/
├── src/
│   ├── main.ts          # Main application logic
│   └── styles/
│       └── main.css     # Complete styling
├── index.html           # HTML structure with full content
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite build configuration
└── README.md           # This file
```

### Key Components

**BalkansJourney Class** (`src/main.ts`):

- Orchestrates the entire interactive experience
- Manages Three.js scenes for each location
- Handles smooth scrolling with Lenis
- Coordinates GSAP animations
- Provides multimedia placeholder functionality

**Styling** (`src/styles/main.css`):

- Modern CSS with custom properties
- Responsive layout using CSS Grid and Flexbox
- Smooth transitions and animations
- Accessibility considerations
- High contrast mode support

### Adding Your Content

The blog is designed to support easy content addition:

#### Photos

Replace the `.media-placeholder` sections with your actual images:

```html
<div class="media-container">
  <img src="your-photo.jpg" alt="Description" />
  <p class="media-caption">Your caption here</p>
</div>
```

#### Audio

Replace the `.audio-placeholder` sections with audio players:

```html
<div class="audio-container">
  <audio controls>
    <source src="your-audio.mp3" type="audio/mpeg" />
  </audio>
  <p class="media-caption">Audio description</p>
</div>
```

#### Additional Reflections

Add new content blocks anywhere within sections:

```html
<div class="content-block">
  <h3>Your Heading</h3>
  <p>Your reflection content...</p>
</div>
```

## 🎯 Performance

The site is optimized for performance:

- **Lazy loading** for Three.js scenes
- **Efficient scroll handling** with RequestAnimationFrame
- **Optimized assets** through Vite bundling
- **Responsive images** and adaptive loading
- **Minimal JavaScript bundle** size

## ♿ Accessibility

Accessibility features include:

- **Keyboard navigation** support
- **Screen reader** compatibility
- **Reduced motion** preferences respected
- **High contrast** mode support
- **Focus indicators** for interactive elements
- **Semantic HTML** structure

## 🌐 Browser Support

- **Chrome** 88+
- **Firefox** 85+
- **Safari** 14+
- **Edge** 88+

## 📖 Academic Context

This project explores themes from:

- **Pierre Nora** - "Lieux de Mémoire" (Sites of Memory)
- **Post-conflict studies** - Community reconstruction theory
- **Urban studies** - Architecture as social agent
- **Memory studies** - Collective trauma and healing

## 🤝 Contributing

To add your own content:

1. Replace placeholder content in `index.html`
2. Add your media files to appropriate directories
3. Update styles in `src/styles/main.css` if needed
4. Test responsiveness across devices

## 📄 License

This project is licensed under the MIT License. See the `package.json` file for details.

## 🎓 Educational Use

This project was created as an educational exploration of:

- Post-conflict reconstruction in the Balkans
- Interactive storytelling techniques
- Modern web development practices
- Academic research presentation

Perfect for students of conflict studies, architecture, or web development who want to see how academic research can be presented through immersive digital experiences.

---

**Built with ❤️ for understanding, remembrance, and reconciliation.**
