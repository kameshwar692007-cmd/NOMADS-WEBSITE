// Nomad's Province — Blueprint Assembler Component
// Progressive component mounting & blueprint wireframe assembly effect.
// Mimics an AI / prompt engine assembling UI components line-by-line with staggered timing.

import { useState, useEffect, Children } from 'react';
import { sound } from '../systems/soundFx.js';

export default function BlueprintAssembler({
  promptText = "Assemble module blueprint...",
  moduleTag = "nomad_engine.sh",
  accentColor = "#38bdf8",
  layout = "grid", // 'grid' | 'list'
  autoRun = true,
  children
}) {
  const [isAssembled, setIsAssembled] = useState(false);
  const [typedPrompt, setTypedPrompt] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  // Typewriter effect for prompt trigger
  useEffect(() => {
    let index = 0;
    setTypedPrompt("");
    setIsTyping(true);

    const interval = setInterval(() => {
      if (index < promptText.length) {
        setTypedPrompt(promptText.substring(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
        if (autoRun) {
          setIsAssembled(true);
        }
      }
    }, 20);

    return () => clearInterval(interval);
  }, [promptText, autoRun]);

  const handleReassemble = () => {
    sound.playSelect();
    setIsAssembled(false);
    setTimeout(() => {
      setIsAssembled(true);
    }, 150);
  };

  const childArray = Children.toArray(children);

  return (
    <div className="blueprint-assembler-root" style={{ '--blueprint-accent': accentColor }}>
      {/* 1. Terminal / Prompt Trigger Console */}
      <div className="blueprint-prompt-terminal">
        <div className="blueprint-terminal-top">
          <div className="terminal-dots">
            <span className="dot dot-red" />
            <span className="dot dot-yellow" />
            <span className="dot dot-green" />
            <span className="terminal-tag">{moduleTag}</span>
          </div>

          <div className="terminal-status-badge">
            <span className={`status-radar-dot ${isAssembled ? 'solid' : 'pulsing'}`} />
            <span>{isTyping ? "PROCESSING PROMPT..." : isAssembled ? "BLUEPRINT ASSEMBLED" : "STANDBY"}</span>
          </div>
        </div>

        <div className="blueprint-prompt-input-row">
          <div className="prompt-text-line">
            <span className="prompt-glyph">$</span>
            <span className="prompt-typing-text">{typedPrompt}</span>
            {isTyping && <span className="prompt-cursor">▋</span>}
          </div>

          <button 
            type="button"
            className="blueprint-run-btn"
            onClick={handleReassemble}
            onMouseEnter={() => sound.playBlip()}
            title="Re-run blueprint assembly sequence"
          >
            <span>{isAssembled ? "↻ RE-ASSEMBLE" : "RUN PROMPT"}</span>
          </button>
        </div>
      </div>

      {/* 2. The Assembling Blueprint Canvas Container */}
      <div className={`blueprint-canvas-container ${isAssembled ? 'assembled' : 'assembling'}`}>
        {/* Subtle Engineering Grid Backdrop */}
        <div className="blueprint-grid-overlay" />
        
        {/* Animated Scanning Laser Beam */}
        {isAssembled && <div className="blueprint-scan-beam" />}

        {/* 3. Staggered Children */}
        <div className={`blueprint-staggered-children layout-${layout}`}>
          {childArray.map((child, index) => (
            <div
              key={index}
              className={`blueprint-mount-item ${isAssembled ? 'mounted' : 'hidden'}`}
              style={{
                '--mount-delay': `${index * 0.18}s`,
                '--mount-step': index + 1
              }}
            >
              <div className="blueprint-wireframe-marker">
                <span>[ STAGE 0{index + 1}: COMPILED ]</span>
              </div>
              {child}
            </div>
          ))}
        </div>

        {/* Blueprint Footer Status Line */}
        {isAssembled && (
          <div className="blueprint-footer-telemetry">
            <div className="telemetry-left">
              <span className="live-spark-dot" />
              <span>Compilation Successful • Hardware Accelerated (60 FPS)</span>
            </div>
            <div className="telemetry-right">
              <span>// NOMAD_SYS.RENDER: OK</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
