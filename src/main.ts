import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "@maptiler/sdk/dist/maptiler-sdk.css";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Global state management
interface JourneyState {
  currentLocation: string;
  progress: number;
  audioPlaying: boolean;
  canvasScenes: Map<string, THREE.Scene>;
}

const journeyState: JourneyState = {
  currentLocation: "hero",
  progress: 0,
  audioPlaying: false,
  canvasScenes: new Map()
};

// Audio management
class AudioManager {
  private audioElements: Map<string, HTMLAudioElement> = new Map();
  private currentlyPlaying: HTMLAudioElement | null = null;

  constructor() {
    this.initializeAudioElements();
  }

  private initializeAudioElements(): void {
    // Placeholder audio elements - would be replaced with actual audio files
    const audioSources = {
      'budva-ambient': '/audio/budva-ambient.mp3',
      'mostar-ambient': '/audio/mostar-ambient.mp3',
      'sarajevo-ambient': '/audio/sarajevo-ambient.mp3'
    };

    Object.entries(audioSources).forEach(([key, src]) => {
      const audio = new Audio();
      audio.src = src;
      audio.loop = true;
      audio.volume = 0.3;
      audio.preload = 'metadata';
      this.audioElements.set(key, audio);
    });
  }

  play(audioKey: string): void {
    this.stopAll();
    const audio = this.audioElements.get(audioKey);
    if (audio) {
      audio.play().catch(() => {
        // Handle autoplay restrictions gracefully
        console.log(`Audio ${audioKey} requires user interaction to play`);
      });
      this.currentlyPlaying = audio;
      journeyState.audioPlaying = true;
    }
  }

  stop(audioKey: string): void {
    const audio = this.audioElements.get(audioKey);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    if (this.currentlyPlaying === audio) {
      this.currentlyPlaying = null;
      journeyState.audioPlaying = false;
    }
  }

  stopAll(): void {
    this.audioElements.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    this.currentlyPlaying = null;
    journeyState.audioPlaying = false;
  }

  fadeOut(audioKey: string, duration: number = 2000): void {
    const audio = this.audioElements.get(audioKey);
    if (audio) {
      gsap.to(audio, {
        volume: 0,
        duration: duration / 1000,
        onComplete: () => this.stop(audioKey)
      });
    }
  }

  fadeIn(audioKey: string, duration: number = 2000): void {
    const audio = this.audioElements.get(audioKey);
    if (audio) {
      audio.volume = 0;
      this.play(audioKey);
      gsap.to(audio, {
        volume: 0.3,
        duration: duration / 1000
      });
    }
  }
}

// 3D Scene management for background canvases
class SceneManager {
  private scenes: Map<string, {
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    canvas: HTMLCanvasElement;
  }> = new Map();

  constructor() {
    this.initializeScenes();
  }

  private initializeScenes(): void {
    const canvases = document.querySelectorAll('.background-canvas') as NodeListOf<HTMLCanvasElement>;
    
    canvases.forEach(canvas => {
      const sceneId = canvas.id;
      if (!sceneId) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);

      this.scenes.set(sceneId, { scene, camera, renderer, canvas });
      this.createSceneContent(sceneId, scene, camera);
    });

    this.startRenderLoop();
    this.handleResize();
  }

  private createSceneContent(sceneId: string, scene: THREE.Scene, camera: THREE.PerspectiveCamera): void {
    switch (sceneId) {
      case "budva-canvas":
        this.createBudvaScene(scene, camera);
        break;
      case "sarajevo-canvas":
        this.createSarajevoScene(scene, camera);
        break;
      case "conclusion-canvas":
        this.createConclusionScene(scene, camera);
        break;
    }
  }


  private createBudvaScene(scene: THREE.Scene, camera: THREE.PerspectiveCamera): void {
    // Coastal medieval architecture representation
    const wallGeometry = new THREE.BoxGeometry(0.5, 2, 0.2);
    const wallMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x2E86AB,
      transparent: true,
      opacity: 0.6
    });

    // Create medieval wall segments
    for (let i = 0; i < 8; i++) {
      const wall = new THREE.Mesh(wallGeometry, wallMaterial);
      const angle = (i / 8) * Math.PI * 2;
      wall.position.set(
        Math.cos(angle) * 3,
        0,
        Math.sin(angle) * 3
      );
      wall.rotation.y = angle;
      scene.add(wall);
    }

    // Add coastal elements (abstract waves)
    const waveGeometry = new THREE.PlaneGeometry(10, 2, 32, 4);
    const waveMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x4A90E2,
      transparent: true,
      opacity: 0.2,
      wireframe: true
    });
    
    const waves = new THREE.Mesh(waveGeometry, waveMaterial);
    waves.rotation.x = -Math.PI / 2;
    waves.position.y = -2;
    scene.add(waves);

    camera.position.set(0, 2, 8);
    camera.lookAt(0, 0, 0);
  }

  private createSarajevoScene(scene: THREE.Scene, camera: THREE.PerspectiveCamera): void {
    // Urban reconstruction - mixed architectural styles
    const buildingGeometry = new THREE.BoxGeometry(1, 3, 1);
    const materials = [
      new THREE.MeshBasicMaterial({ color: 0xF18F01, transparent: true, opacity: 0.8 }),
      new THREE.MeshBasicMaterial({ color: 0xE0E0E0, transparent: true, opacity: 0.6 }),
      new THREE.MeshBasicMaterial({ color: 0x8B4513, transparent: true, opacity: 0.7 })
    ];

    // Create city blocks with varying heights and materials
    for (let x = -4; x <= 4; x += 2) {
      for (let z = -4; z <= 4; z += 2) {
        const building = new THREE.Mesh(
          buildingGeometry, 
          materials[Math.floor(Math.random() * materials.length)]
        );
        building.position.set(x, 1.5, z);
        building.scale.y = Math.random() * 0.5 + 0.5;
        scene.add(building);
      }
    }

    // Add connecting elements (bridges, roads)
    const connectionGeometry = new THREE.PlaneGeometry(0.2, 8);
    const connectionMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x333333,
      transparent: true,
      opacity: 0.5
    });

    for (let i = 0; i < 3; i++) {
      const connection = new THREE.Mesh(connectionGeometry, connectionMaterial);
      connection.rotation.x = -Math.PI / 2;
      connection.position.set(i * 2 - 2, 0.1, 0);
      scene.add(connection);
    }

    camera.position.set(8, 5, 8);
    camera.lookAt(0, 0, 0);
  }

  private createConclusionScene(scene: THREE.Scene, camera: THREE.PerspectiveCamera): void {
    // Healing/reconstruction theme - growing organic forms
    const geometry = new THREE.SphereGeometry(0.5, 8, 6);
    const materials = [
      new THREE.MeshBasicMaterial({ color: 0xC73E1D, transparent: true, opacity: 0.4 }),
      new THREE.MeshBasicMaterial({ color: 0xF18F01, transparent: true, opacity: 0.6 }),
      new THREE.MeshBasicMaterial({ color: 0x2E86AB, transparent: true, opacity: 0.5 })
    ];

    for (let i = 0; i < 12; i++) {
      const sphere = new THREE.Mesh(geometry, materials[i % materials.length]);
      const radius = 2 + Math.random() * 3;
      const angle = (i / 12) * Math.PI * 2;
      sphere.position.set(
        Math.cos(angle) * radius,
        Math.sin(i * 0.5) * 2,
        Math.sin(angle) * radius
      );
      sphere.scale.setScalar(Math.random() * 0.5 + 0.5);
      scene.add(sphere);
    }

    camera.position.set(0, 3, 8);
    camera.lookAt(0, 0, 0);
  }

  private startRenderLoop(): void {
    const animate = (): void => {
      requestAnimationFrame(animate);
      
      this.scenes.forEach((sceneData, sceneId) => {
        const { scene, camera, renderer } = sceneData;
        
        // Add subtle animations based on scene type
        scene.children.forEach((child, index) => {
          if (child instanceof THREE.Mesh) {
            switch (sceneId) {
              case "hero-canvas":
                // Floating particle animation
                if (child.userData && typeof child.userData.originalY === "number" && typeof child.userData.floatSpeed === "number") {
                  child.position.y = child.userData.originalY + Math.sin(Date.now() * child.userData.floatSpeed) * 0.5;
                  child.rotation.y += 0.005;
                }
                break;
              case "intro-canvas":
                child.rotation.x += 0.001;
                child.rotation.y += 0.002;
                break;
              case "budva-canvas":
                if (child.material && "wireframe" in child.material) {
                  // Animate waves
                  child.position.y = Math.sin(Date.now() * 0.001 + index) * 0.1 - 2;
                }
                break;
              case "sarajevo-canvas":
                // Breathing city effect
                child.scale.y = 1 + Math.sin(Date.now() * 0.001 + index * 0.5) * 0.05;
                break;
              case "conclusion-canvas":
                // Orbital movement
                const time = Date.now() * 0.001;
                child.rotation.y += 0.01;
                child.position.y += Math.sin(time + index) * 0.01;
                break;
            }
          }
        });
        
        renderer.render(scene, camera);
      });
    };
    
    animate();
  }

  private handleResize(): void {
    window.addEventListener('resize', () => {
      this.scenes.forEach(({ camera, renderer, canvas }) => {
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      });
    });
  }

  destroy(): void {
    this.scenes.forEach(({ renderer }) => {
      renderer.dispose();
    });
    this.scenes.clear();
  }
}

// Progress and navigation management
class NavigationManager {
  private progressFill: HTMLElement | null = null;
  private locationMarkers: NodeListOf<Element> | null = null;
  private currentLocationElement: HTMLElement | null = null;
  private journeyNav: HTMLElement | null = null;

  constructor() {
    this.initializeElements();
    this.setupScrollTriggers();
    this.bindEvents();
  }

  private initializeElements(): void {
    this.progressFill = document.querySelector('.progress-fill');
    this.locationMarkers = document.querySelectorAll('.marker');
    this.currentLocationElement = document.querySelector('.location-name');
    this.journeyNav = document.querySelector('.journey-navigation');
  }

  private setupScrollTriggers(): void {
    const sections = document.querySelectorAll('.journey-section');
    
    sections.forEach((section, index) => {
      const locationName = section.getAttribute('data-location') || '';
      
      ScrollTrigger.create({
        trigger: section,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => this.updateLocation(locationName, index, sections.length),
        onEnterBack: () => this.updateLocation(locationName, index, sections.length),
        onLeave: () => {
          if (index === sections.length - 1) {
            this.updateProgress(100);
          }
        }
      });

      // Show navigation after hero section
      if (index === 1) {
        ScrollTrigger.create({
          trigger: section,
          start: "top bottom",
          onEnter: () => {
            if (this.journeyNav) {
              this.journeyNav.classList.add("visible");
            }
          },
          onLeaveBack: () => {
            if (this.journeyNav) {
              this.journeyNav.classList.remove("visible");
            }
          }
        });
      }
    });

    // Smooth progress updates
    ScrollTrigger.create({
      trigger: 'body',
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        this.updateProgress(self.progress * 100);
      }
    });
  }

  private updateLocation(locationName: string, index: number, totalSections: number): void {
    journeyState.currentLocation = locationName;
    
    // Update progress based on section
    const progressPercentage = (index / (totalSections - 1)) * 100;
    this.updateProgress(progressPercentage);
    
    // Update markers
    if (this.locationMarkers) {
      this.locationMarkers.forEach((marker, markerIndex) => {
        marker.classList.toggle('active', markerIndex === index);
      });
    }
    
    // Update current location display
    if (this.currentLocationElement) {
      const locationDisplayNames: Record<string, string> = {
        "hero": "Journey Begins",
        "intro": "Introduction",
        "witness": "Theory",
        "mostar": "Mostar, Bosnia and Herzegovina",
        "budva": "Budva, Montenegro",
        "sarajevo": "Sarajevo, Bosnia and Herzegovina",
        "erasure": "Erasure of Memory",
        "war-tourism": "Memory as Commodity",
        "conclusion": "Conclusion"
      };
      
      this.currentLocationElement.textContent = locationDisplayNames[locationName] || locationName;
    }
  }

  private updateProgress(percentage: number): void {
    journeyState.progress = percentage;
    if (this.progressFill) {
      gsap.to(this.progressFill, {
        width: `${percentage}%`,
        duration: 0.5,
        ease: 'power2.out'
      });
    }
  }

  private bindEvents(): void {
    // Marker click navigation
    if (this.locationMarkers) {
      this.locationMarkers.forEach((marker, index) => {
        marker.addEventListener('click', () => {
          const sections = document.querySelectorAll('.journey-section');
          if (sections[index]) {
            sections[index].scrollIntoView({ 
              behavior: 'smooth',
              block: 'start'
            });
          }
        });
      });
    }
  }
}

// Audio control management
class AudioControlManager {
  private audioManager: AudioManager;
  private activeButton: HTMLElement | null = null;

  constructor(audioManager: AudioManager) {
    this.audioManager = audioManager;
    this.bindAudioControls();
  }

  private bindAudioControls(): void {
    const soundscapeButtons = document.querySelectorAll('.soundscape-btn');
    
    soundscapeButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const audioKey = target.getAttribute('data-audio');
        
        if (!audioKey) return;
        
        if (target.classList.contains('playing')) {
          // Stop current audio
          this.audioManager.fadeOut(audioKey);
          target.classList.remove('playing');
          this.activeButton = null;
        } else {
          // Stop any current audio and start new one
          if (this.activeButton) {
            this.activeButton.classList.remove('playing');
          }
          
          this.audioManager.fadeIn(audioKey);
          target.classList.add('playing');
          this.activeButton = target;
        }
      });
    });
  }
}

// Animation management for content reveals
class AnimationManager {
  constructor() {
    this.setupContentAnimations();
    this.setupTransitionAnimations();
  }

  private setupContentAnimations(): void {
    // Animate introduction section content on scroll from hero
    const introQuote = document.querySelector(".intro-section .immersive-quote");
    const introContent = document.querySelector(".introduction-content");
    
    if (introQuote) {
      ScrollTrigger.create({
        trigger: introQuote,
        start: "top 80%",
        end: "bottom 20%",
        onEnter: () => {
          introQuote.classList.add("animate");
        },
        onLeaveBack: () => {
          introQuote.classList.remove("animate");
        }
      });
    }
    
    if (introContent) {
      ScrollTrigger.create({
        trigger: introContent,
        start: "top 75%",
        end: "bottom 20%",
        onEnter: () => {
          introContent.classList.add("animate");
        },
        onLeaveBack: () => {
          introContent.classList.remove("animate");
        }
      });
    }

    // Animate narrative blocks on scroll
    const narrativeBlocks = document.querySelectorAll(".narrative-block");
    
    narrativeBlocks.forEach((block, index) => {
      gsap.fromTo(block, {
        opacity: 0,
        y: 50
      }, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay: index * 0.1,
        scrollTrigger: {
          trigger: block,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse"
        }
      });
    });

    // Animate media placeholders
    const mediaPlaceholders = document.querySelectorAll(".media-placeholder");
    
    mediaPlaceholders.forEach((placeholder) => {
      gsap.fromTo(placeholder, {
        opacity: 0,
        scale: 0.8
      }, {
        opacity: 1,
        scale: 1,
        duration: 0.6,
        scrollTrigger: {
          trigger: placeholder,
          start: "top 85%",
          toggleActions: "play none none reverse"
        }
      });
    });

    // Animate observation panels
    const observationPanels = document.querySelectorAll(".observation-panel");
    
    observationPanels.forEach((panel) => {
      gsap.fromTo(panel, {
        opacity: 0,
        x: -50
      }, {
        opacity: 1,
        x: 0,
        duration: 0.7,
        scrollTrigger: {
          trigger: panel,
          start: "top 80%",
          toggleActions: "play none none reverse"
        }
      });
    });
  }

  private setupTransitionAnimations(): void {
    // Section transition effects
    const sections = document.querySelectorAll('.journey-section');
    
    sections.forEach((section, index) => {
      if (index === 0) return; // Skip intro section
      
      const overlay = section.querySelector('.background-overlay');
      if (overlay) {
        gsap.fromTo(overlay, {
          opacity: 0
        }, {
          opacity: 1,
          duration: 1,
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'top center',
            scrub: true
          }
        });
      }
    });
  }
}

// Media insertion placeholder management
class MediaManager {
  constructor() {
    this.bindMediaControls();
  }

  private bindMediaControls(): void {
    const mediaButtons = document.querySelectorAll('.media-insert-btn');
    mediaButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const placeholder = button.closest('.media-placeholder');
        if (placeholder) {
          this.showMediaUploadInterface(placeholder);
        }
      });
    });
  }

  private showMediaUploadInterface(placeholder: Element): void {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'media-upload-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      backdrop-filter: blur(10px);
    `;

    // Create upload interface
    const uploadInterface = document.createElement('div');
    uploadInterface.className = 'upload-interface';
    uploadInterface.style.cssText = `
      background: white;
      padding: 32px;
      border-radius: 16px;
      max-width: 500px;
      width: 90%;
      text-align: center;
      font-family: var(--font-interface);
    `;

    const title = placeholder.querySelector('h4')?.textContent || 'Media Upload';
    uploadInterface.innerHTML = `
      <h3 style="margin-bottom: 16px; color: #2c3e50;">${title}</h3>
      <p style="margin-bottom: 24px; color: #7f8c8d;">Choose how you'd like to add this media:</p>
      <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;">
        <button class="upload-option" data-type="file" style="padding: 12px 24px; background: #3498db; color: white; border: none; border-radius: 8px; cursor: pointer;">
          📁 Upload File
        </button>
        <button class="upload-option" data-type="url" style="padding: 12px 24px; background: #e74c3c; color: white; border: none; border-radius: 8px; cursor: pointer;">
          🔗 Add URL
        </button>
        <button class="upload-option" data-type="placeholder" style="padding: 12px 24px; background: #95a5a6; color: white; border: none; border-radius: 8px; cursor: pointer;">
          📝 Keep Placeholder
        </button>
      </div>
      <button class="close-upload" style="margin-top: 24px; padding: 8px 16px; background: transparent; border: 1px solid #bdc3c7; border-radius: 4px; cursor: pointer;">
        Cancel
      </button>
    `;

    overlay.appendChild(uploadInterface);
    document.body.appendChild(overlay);

    // Bind events
    overlay.querySelector('.close-upload')?.addEventListener('click', () => {
      document.body.removeChild(overlay);
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        document.body.removeChild(overlay);
      }
    });
  }
}

/**
 * Manages the vintage postcard interactions
 */
class PostcardManager {
  private activePostcard: HTMLElement | null = null;

  constructor() {
    this.bindPostcardClicks();
  }

  private bindPostcardClicks(): void {
    const postcards = document.querySelectorAll('.postcard');
    
    postcards.forEach(postcard => {
      postcard.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.togglePostcard(postcard as HTMLElement);
      });
    });

    // Close active postcard when clicking outside the postcards fan area
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const postcardsContainer = document.querySelector('.postcards-fan');
      
      if (this.activePostcard && postcardsContainer && !postcardsContainer.contains(target)) {
        this.closeActivePostcard();
      }
    });

    // Handle escape key to close active postcard
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.activePostcard) {
        this.closeActivePostcard();
      }
    });
  }

  private togglePostcard(postcard: HTMLElement): void {
    // If clicking the already active postcard, close it
    if (this.activePostcard === postcard) {
      this.closeActivePostcard();
      return;
    }

    // Close any currently active postcard
    if (this.activePostcard) {
      this.closeActivePostcard();
    }

    // Activate the clicked postcard
    this.activatePostcard(postcard);
  }

  private activatePostcard(postcard: HTMLElement): void {
    // Remove active class from all postcards first
    const allPostcards = document.querySelectorAll('.postcard');
    allPostcards.forEach(card => card.classList.remove('active'));
    
    // Add active class to clicked postcard
    postcard.classList.add('active');
    this.activePostcard = postcard;

    // Animate the postcard to center with GSAP
    gsap.to(postcard, {
      transform: "rotate(0deg) translateY(-40px) translateX(0px) scale(1.15)",
      duration: 0.8,
      ease: "power3.out",
      onComplete: () => {
        // Show description after centering animation completes
        const description = postcard.querySelector('.postcard-description');
        if (description) {
          gsap.to(description, {
            opacity: 1,
            y: 0,
            duration: 0.4,
            ease: "power2.out"
          });
        }
      }
    });

    // Fade out other postcards slightly
    allPostcards.forEach(card => {
      if (card !== postcard) {
        gsap.to(card, {
          opacity: 0.7,
          duration: 0.6,
          ease: "power2.out"
        });
      }
    });
  }

  private closeActivePostcard(): void {
    if (!this.activePostcard) return;

    const activeCard = this.activePostcard;
    
    // Hide description first
    const description = activeCard.querySelector('.postcard-description');
    if (description) {
      gsap.to(description, {
        opacity: 0,
        y: 10,
        duration: 0.3,
        ease: "power2.in"
      });
    }

    // Animate back to original position
    // Get the original transform for this specific postcard
    const originalTransform = this.getOriginalTransform(activeCard);
    
    gsap.to(activeCard, {
      transform: originalTransform,
      duration: 0.6,
      ease: "power2.inOut",
      onComplete: () => {
        activeCard.classList.remove('active');
      }
    });

    // Restore opacity for all postcards
    const allPostcards = document.querySelectorAll('.postcard');
    allPostcards.forEach(card => {
      gsap.to(card, {
        opacity: 1,
        duration: 0.6,
        ease: "power2.out"
      });
    });

    this.activePostcard = null;
  }

  private getOriginalTransform(postcard: HTMLElement): string {
    // Determine the original transform based on the postcard's class
    if (postcard.classList.contains('postcard-1')) {
      return "rotate(-45deg) translateY(-25px) translateX(-150px)";
    } else if (postcard.classList.contains('postcard-2')) {
      return "rotate(-22deg) translateY(-15px) translateX(-75px)";
    } else if (postcard.classList.contains('postcard-3')) {
      return "rotate(0deg)";
    } else if (postcard.classList.contains('postcard-4')) {
      return "rotate(22deg) translateY(-15px) translateX(75px)";
    } else if (postcard.classList.contains('postcard-5')) {
      return "rotate(45deg) translateY(-25px) translateX(150px)";
    }
    return "rotate(0deg)"; // fallback
  }

  public closeAll(): void {
    if (this.activePostcard) {
      this.closeActivePostcard();
    }
  }
}

// Main application initialization
class JourneyApp {
  private audioManager: AudioManager;
  private sceneManager: SceneManager;

  constructor() {
    this.audioManager = new AudioManager();
    this.sceneManager = new SceneManager();
    
    // Initialize managers for their side effects (event binding, etc.)
    new NavigationManager();
    new AudioControlManager(this.audioManager);
    new AnimationManager();
    new MediaManager();
    new PostcardManager();
    
    this.initializeApp();
  }

  private initializeApp(): void {
    // Initialize smooth scrolling
    this.initializeSmoothScrolling();
    
    // Set up global event listeners
    this.setupKeyboardNavigation();
    this.setupMapToggle();
    this.initializeHeroVideo();
    this.initializeHeroImage();
    
    // Handle visibility changes to pause audio when tab is not active
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.audioManager.stopAll();
      }
    });

    // Add smooth scrolling behavior
    document.documentElement.style.scrollBehavior = "smooth";
    
    console.log("Interactive documentary journey initialized");
  }

  private initializeSmoothScrolling(): void {
    // Initialize Lenis for smooth scrolling
    const lenis = new Lenis();

    // Connect Lenis with GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
  }

  private setupKeyboardNavigation(): void {
    document.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowDown':
        case ' ':
          e.preventDefault();
          this.navigateNext();
          break;
        case 'ArrowUp':
          e.preventDefault();
          this.navigatePrevious();
          break;
        case 'Escape':
          this.audioManager.stopAll();
          break;
      }
    });
  }

  private setupMapToggle(): void {
    const mapToggle = document.querySelector('.map-toggle');
    const mapOverlay = document.querySelector('.map-overlay');
    
    if (mapToggle && mapOverlay) {
      mapToggle.addEventListener('click', () => {
        mapOverlay.classList.toggle('expanded');
      });
    }
  }

  private initializeHeroVideo(): void {
    const heroVideo = document.getElementById('hero-video') as HTMLVideoElement;
    if (heroVideo) {
      // Ensure video plays when it's loaded
      heroVideo.addEventListener('loadeddata', () => {
        heroVideo.play().catch(() => {
          // Handle autoplay restrictions
          console.log('Hero video autoplay was prevented by browser policy');
        });
      });

      // Ensure video loops smoothly
      heroVideo.addEventListener('ended', () => {
        heroVideo.currentTime = 0;
        heroVideo.play().catch(() => {
          console.log('Hero video restart was prevented');
        });
      });

      // Pause video when not in view to save resources
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            heroVideo.play().catch(() => {});
          } else {
            heroVideo.pause();
          }
        });
      }, { threshold: 0.1 });

      observer.observe(heroVideo);
    }
  }

  private initializeHeroImage(): void {
    const heroImage = document.getElementById('hero-image') as HTMLImageElement;
    if (heroImage) {
      // Add subtle animation or effects to the hero image if needed
      heroImage.addEventListener('load', () => {
        console.log('Hero image loaded successfully');
        // Add any initialization effects here
      });

      // Handle any image loading errors
      heroImage.addEventListener('error', () => {
        console.error('Failed to load hero image');
      });
    }
  }

  private navigateNext(): void {
    const sections = document.querySelectorAll('.journey-section');
    const currentIndex = Array.from(sections).findIndex(section => {
      const rect = section.getBoundingClientRect();
      return rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2;
    });
    
    if (currentIndex < sections.length - 1) {
      const nextSection = sections[currentIndex + 1];
      if (nextSection) {
        nextSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  }

  private navigatePrevious(): void {
    const sections = document.querySelectorAll('.journey-section');
    const currentIndex = Array.from(sections).findIndex(section => {
      const rect = section.getBoundingClientRect();
      return rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2;
    });
    
    if (currentIndex > 0) {
      const previousSection = sections[currentIndex - 1];
      if (previousSection) {
        previousSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  }

  destroy(): void {
    this.audioManager.stopAll();
    this.sceneManager.destroy();
    ScrollTrigger.killAll();
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new JourneyApp();
});

// Export for potential external use
export { JourneyApp, journeyState };

// Global function for expandable content
(window as any).toggleExpand = function(button: HTMLButtonElement): void {
  const expandedText = button.nextElementSibling as HTMLElement;
  const expandIcon = button.querySelector('.expand-icon') as HTMLElement;
  const expandTextElement = button.querySelector('.expand-text') as HTMLElement;
  
  if (expandedText && expandIcon) {
    const isExpanded = button.classList.contains('expanded');
    
    if (isExpanded) {
      // Collapse
      button.classList.remove('expanded');
      expandedText.classList.remove('show');
      expandTextElement.textContent = 'Learn More';
    } else {
      // Expand
      button.classList.add('expanded');
      expandedText.classList.add('show');
      expandTextElement.textContent = 'Show Less';
    }
  }
}; 