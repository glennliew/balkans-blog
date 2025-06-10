import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "@maptiler/sdk/dist/maptiler-sdk.css";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

/**
 * Interface for section configuration
 */
interface SectionConfig {
  id: string;
  title: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

/**
 * Interface for Three.js scene configuration
 */
interface SceneConfig {
  canvas: HTMLCanvasElement;
  section: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
  };
}

// Global state management
interface JourneyState {
  currentLocation: string;
  progress: number;
  audioPlaying: boolean;
  canvasScenes: Map<string, THREE.Scene>;
}

const journeyState: JourneyState = {
  currentLocation: 'intro',
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
      case 'budva-canvas':
        this.createBudvaScene(scene, camera);
        break;
      case 'mostar-canvas':
        this.createMostarScene(scene, camera);
        break;
      case 'sarajevo-canvas':
        this.createSarajevoScene(scene, camera);
        break;
      case 'conclusion-canvas':
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

  private createMostarScene(scene: THREE.Scene, camera: THREE.PerspectiveCamera): void {
    // Bridge and destroyed building representation
    const bridgeGeometry = new THREE.CylinderGeometry(0.1, 0.1, 6, 8);
    const bridgeMaterial = new THREE.MeshBasicMaterial({ color: 0xA23B72 });
    
    const bridge = new THREE.Mesh(bridgeGeometry, bridgeMaterial);
    bridge.rotation.z = Math.PI / 2;
    bridge.position.y = 1;
    scene.add(bridge);

    // Broken/damaged building elements
    const debrisGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
    const debrisMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x666666,
      transparent: true,
      opacity: 0.7
    });

    for (let i = 0; i < 15; i++) {
      const debris = new THREE.Mesh(debrisGeometry, debrisMaterial.clone());
      debris.position.set(
        (Math.random() - 0.5) * 8,
        Math.random() * 3,
        (Math.random() - 0.5) * 8
      );
      debris.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      scene.add(debris);
    }

    // River representation
    const riverGeometry = new THREE.PlaneGeometry(8, 20);
    const riverMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x4A90E2,
      transparent: true,
      opacity: 0.3
    });
    
    const river = new THREE.Mesh(riverGeometry, riverMaterial);
    river.rotation.x = -Math.PI / 2;
    river.position.y = -1;
    scene.add(river);

    camera.position.set(0, 3, 10);
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
              case 'intro-canvas':
                child.rotation.x += 0.001;
                child.rotation.y += 0.002;
                break;
              case 'budva-canvas':
                if (child.material && 'wireframe' in child.material) {
                  // Animate waves
                  child.position.y = Math.sin(Date.now() * 0.001 + index) * 0.1 - 2;
                }
                break;
              case 'mostar-canvas':
                if (child.geometry instanceof THREE.BoxGeometry) {
                  // Subtle debris movement
                  child.rotation.y += 0.0005;
                }
                break;
              case 'sarajevo-canvas':
                // Breathing city effect
                child.scale.y = 1 + Math.sin(Date.now() * 0.001 + index * 0.5) * 0.05;
                break;
              case 'conclusion-canvas':
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

      // Show navigation after first section
      if (index === 1) {
        ScrollTrigger.create({
          trigger: section,
          start: 'top bottom',
          onEnter: () => {
            if (this.journeyNav) {
              this.journeyNav.classList.add('visible');
            }
          },
          onLeaveBack: () => {
            if (this.journeyNav) {
              this.journeyNav.classList.remove('visible');
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
        'intro': 'Introduction',
        'budva': 'Budva, Montenegro',
        'mostar': 'Mostar, Bosnia and Herzegovina',
        'sarajevo': 'Sarajevo, Bosnia and Herzegovina',
        'conclusion': 'Conclusion'
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
    // Animate narrative blocks on scroll
    const narrativeBlocks = document.querySelectorAll('.narrative-block');
    
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
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse'
        }
      });
    });

    // Animate media placeholders
    const mediaPlaceholders = document.querySelectorAll('.media-placeholder');
    
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
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      });
    });

    // Animate observation panels
    const observationPanels = document.querySelectorAll('.observation-panel');
    
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
          start: 'top 80%',
          toggleActions: 'play none none reverse'
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
    const mediaInsertButtons = document.querySelectorAll('.media-insert-btn');
    
    mediaInsertButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const placeholder = (e.target as HTMLElement).closest('.media-placeholder');
        if (placeholder) {
          // Simulate media upload interface
          this.showMediaUploadInterface(placeholder);
        }
      });
    });
  }

  private showMediaUploadInterface(placeholder: Element): void {
    // Create upload interface overlay
    const overlay = document.createElement('div');
    overlay.className = 'media-upload-overlay';
    overlay.innerHTML = `
      <div class="upload-modal">
        <h3>Add Media</h3>
        <p>This is where you would upload and configure your media content.</p>
        <div class="upload-options">
          <button class="upload-btn photo">📷 Upload Photo</button>
          <button class="upload-btn audio">🎵 Upload Audio</button>
          <button class="upload-btn text">✍️ Add Text</button>
        </div>
        <button class="close-upload">Close</button>
      </div>
    `;
    
    // Style the overlay
    Object.assign(overlay.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: '2000'
    });
    
    const modal = overlay.querySelector('.upload-modal') as HTMLElement;
    Object.assign(modal.style, {
      backgroundColor: 'white',
      padding: '40px',
      borderRadius: '16px',
      textAlign: 'center',
      maxWidth: '500px',
      width: '90%'
    });
    
    document.body.appendChild(overlay);
    
    // Bind close functionality
    overlay.querySelector('.close-upload')?.addEventListener('click', () => {
      overlay.remove();
    });
    
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
      }
    });
  }
}

// Main application initialization
class JourneyApp {
  private audioManager: AudioManager;
  private sceneManager: SceneManager;
  private navigationManager: NavigationManager;
  private audioControlManager: AudioControlManager;
  private animationManager: AnimationManager;
  private mediaManager: MediaManager;

  constructor() {
    this.audioManager = new AudioManager();
    this.sceneManager = new SceneManager();
    this.navigationManager = new NavigationManager();
    this.audioControlManager = new AudioControlManager(this.audioManager);
    this.animationManager = new AnimationManager();
    this.mediaManager = new MediaManager();
    
    this.initializeApp();
  }

  private initializeApp(): void {
    // Set up global event listeners
    this.setupKeyboardNavigation();
    this.setupMapToggle();
    this.initializeHeroVideo();
    
    // Handle visibility changes to pause audio when tab is not active
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.audioManager.stopAll();
      }
    });

    // Add smooth scrolling behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    
    console.log('Interactive documentary journey initialized');
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