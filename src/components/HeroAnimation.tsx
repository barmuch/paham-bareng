'use client';

export default function HeroAnimation() {
  // Center convergence point (in viewport)
  const centerX = 50; // 50% of viewport width
  const centerY = 300; // pixels from top (in hero section)
  
  // Generate random paths from different edges
  const generateRandomPaths = () => {
    const paths = [];
    const numPaths = 40; // More paths for better coverage
    
    for (let i = 0; i < numPaths; i++) {
      let startX, startY, startSide;
      
      // Randomly choose which edge to start from
      const edge = Math.random();
      
      if (edge < 0.35) {
        // Bottom edge
        startX = Math.random() * 100;
        startY = 100;
        startSide = 'bottom';
      } else if (edge < 0.5) {
        // Left edge
        startX = 0;
        startY = 20 + Math.random() * 80;
        startSide = 'left';
      } else if (edge < 0.65) {
        // Right edge
        startX = 100;
        startY = 20 + Math.random() * 80;
        startSide = 'right';
      } else {
        // Top edge (less frequent)
        startX = Math.random() * 100;
        startY = 0;
        startSide = 'top';
      }
      
      // Create curved path to center with random control points
      const offsetX = (Math.random() - 0.5) * 30;
      const offsetY = (Math.random() - 0.5) * 20;
      
      // Control points for smooth curve
      const cp1X = startX + (centerX - startX) * 0.3 + offsetX;
      const cp1Y = startY + (centerY/10 - startY) * 0.3 + offsetY;
      const cp2X = startX + (centerX - startX) * 0.7 - offsetX * 0.5;
      const cp2Y = startY + (centerY/10 - startY) * 0.7 - offsetY * 0.5;
      
      // Add some randomness to final point so they don't all converge to exact same spot
      const finalX = centerX + (Math.random() - 0.5) * 3;
      const finalY = centerY + (Math.random() - 0.5) * 20;
      
      paths.push({
        id: i,
        d: `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${finalX} ${finalY/10}`,
        delay: Math.random() * 5,
        duration: 8 + Math.random() * 6,
        color: i % 3 === 0 ? '#87ab8a' : i % 3 === 1 ? '#d4a574' : '#c19a6b',
        opacity: 0.3 + Math.random() * 0.3,
      });
    }
    
    return paths;
  };

  const paths = generateRandomPaths();

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Background subtle leaf patterns */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="leaf-pattern" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
              <path
                d="M50,50 Q60,30 70,50 T90,50"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                opacity="0.3"
                className="animate-leaf-drift"
              />
              <path
                d="M120,80 Q130,60 140,80 T160,80"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                opacity="0.3"
                className="animate-leaf-drift-delayed"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#leaf-pattern)" />
        </svg>
      </div>

      {/* Center convergence point glow */}
      <div className="absolute top-[300px] left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-accent-mustard-400 opacity-70 blur-md animate-pulse" />
      <div className="absolute top-[300px] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-accent-mustard-300 opacity-90 animate-pulse" />

      {/* Main SVG for paths and particles - uses percentage-based viewBox */}
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          {/* Gradients for paths */}
          <linearGradient id="path-gradient-1" x1="0%" y1="100%" x2="50%" y2="30%">
            <stop offset="0%" stopColor="#87ab8a" stopOpacity="0.25">
              <animate attributeName="stopOpacity" values="0.15;0.4;0.15" dur="5s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#d4a574" stopOpacity="0.4">
              <animate attributeName="stopOpacity" values="0.3;0.6;0.3" dur="5s" repeatCount="indefinite" />
            </stop>
          </linearGradient>

          <linearGradient id="path-gradient-2" x1="100%" y1="100%" x2="50%" y2="30%">
            <stop offset="0%" stopColor="#c19a6b" stopOpacity="0.25">
              <animate attributeName="stopOpacity" values="0.15;0.4;0.15" dur="5s" repeatCount="indefinite" begin="1s" />
            </stop>
            <stop offset="100%" stopColor="#87ab8a" stopOpacity="0.4">
              <animate attributeName="stopOpacity" values="0.3;0.6;0.3" dur="5s" repeatCount="indefinite" begin="1s" />
            </stop>
          </linearGradient>

          <linearGradient id="path-gradient-3" x1="50%" y1="100%" x2="50%" y2="30%">
            <stop offset="0%" stopColor="#d4a574" stopOpacity="0.25">
              <animate attributeName="stopOpacity" values="0.15;0.4;0.15" dur="5s" repeatCount="indefinite" begin="2s" />
            </stop>
            <stop offset="100%" stopColor="#c19a6b" stopOpacity="0.4">
              <animate attributeName="stopOpacity" values="0.3;0.6;0.3" dur="5s" repeatCount="indefinite" begin="2s" />
            </stop>
          </linearGradient>

          {/* Soft glow for particles */}
          <filter id="particle-glow" x="-150%" y="-150%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="0.3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Render all paths converging to center */}
        {paths.map((path) => (
          <g key={path.id}>
            {/* Path line */}
            <path
              d={path.d}
              fill="none"
              stroke={`url(#path-gradient-${(path.id % 3) + 1})`}
              strokeWidth="0.15"
              strokeLinecap="round"
              opacity={path.opacity}
              style={{
                animationDelay: `${path.delay}s`,
              }}
            />
            {/* Particle following path */}
            <circle 
              r="0.25" 
              fill={path.color} 
              filter="url(#particle-glow)" 
              opacity="0.8"
            >
              <animateMotion
                dur={`${path.duration}s`}
                repeatCount="indefinite"
                begin={`${path.delay}s`}
                path={path.d}
                keyPoints="0;1"
                keyTimes="0;1"
              />
              <animate 
                attributeName="opacity" 
                values="0.2;1;0.2" 
                dur="2.5s" 
                repeatCount="indefinite" 
                begin={`${path.delay}s`} 
              />
              <animate 
                attributeName="r" 
                values="0.15;0.35;0.15" 
                dur="2.5s" 
                repeatCount="indefinite" 
                begin={`${path.delay}s`} 
              />
            </circle>
          </g>
        ))}
      </svg>

      <style jsx>{`
        @keyframes leaf-drift {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-10px) translateX(5px); }
        }

        @keyframes leaf-drift-delayed {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-8px) translateX(-5px); }
        }

        @keyframes path-draw {
          0% { stroke-dasharray: 0 3000; }
          100% { stroke-dasharray: 3000 0; }
        }

        .animate-leaf-drift {
          animation: leaf-drift 8s ease-in-out infinite;
        }

        .animate-leaf-drift-delayed {
          animation: leaf-drift-delayed 10s ease-in-out infinite;
          animation-delay: 2s;
        }

        .animate-path-draw {
          stroke-dasharray: 3000;
          stroke-dashoffset: 0;
        }

        .animate-path-draw-delayed {
          stroke-dasharray: 3000;
          stroke-dashoffset: 0;
        }
      `}</style>
    </div>
  );
}
