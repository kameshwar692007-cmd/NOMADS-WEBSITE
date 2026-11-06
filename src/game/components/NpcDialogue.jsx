import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sound } from '../systems/soundFx.js';
import './NpcDialogue.css';

// One isolated image per NPC: avoids atlas crop bleed and scales cleanly in the dialogue.
const PORTRAITS = [
  '/assets/onboarding/portraits/guide.svg',
  '/assets/onboarding/portraits/ezra.svg',
  '/assets/onboarding/portraits/rex.svg',
  '/assets/onboarding/portraits/kai.svg',
  '/assets/onboarding/portraits/nova.svg',
  '/assets/onboarding/portraits/ari.svg',
  '/assets/onboarding/portraits/aiden.svg',
];
export function NpcPortrait({ portraitIndex = 0, name = 'Character', className = '' }) {
  const index = Number.isInteger(portraitIndex) && portraitIndex >= 0 && portraitIndex < PORTRAITS.length ? portraitIndex : 0;
  return (
    <div className={'np-portrait-frame ' + className}>
      <img className="np-portrait-image" src={PORTRAITS[index]}
        alt={name + ' portrait'} draggable="false" width="512" height="512" />
    </div>
  );
}

export default function NpcDialogue({ npc, onClose }) {
  const navigate = useNavigate();
  const message = npc?.message || '';
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!npc) return;
    sound.playInteract();
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    setShown(reduced ? message.length : 0);
    if (reduced) return;
    let amount = 0;
    const timer = window.setInterval(() => {
      amount = Math.min(message.length, amount + 2);
      setShown(amount);
      sound.playDialogueChirp();
      if (amount >= message.length) window.clearInterval(timer);
    }, 22);
    return () => window.clearInterval(timer);
  }, [npc?.id, message]);

  useEffect(() => {
    if (!npc) return;
    const onKey = e => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        sound.playCancel();
        onClose();
      }
      if (e.key === 'Enter' && shown < message.length) {
        sound.playBlip();
        setShown(message.length);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [npc, onClose, shown, message.length]);

  if (!npc) return null;

  const handleClose = () => {
    sound.playCancel();
    onClose();
  };

  const continueToPage = () => {
    if (shown < message.length) {
      sound.playBlip();
      setShown(message.length);
      return;
    }
    sound.playDoorEnter();
    onClose();
    if (npc.route) navigate(npc.route);
  };

  return (
    <div className="np-dialogue-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) handleClose(); }}>
      <section className="np-dialogue" role="dialog" aria-modal="true" aria-label={npc.name + ' dialogue'}>
        <button
          type="button"
          className="np-dialogue-close"
          onClick={handleClose}
          onMouseEnter={() => sound.playBlip()}
          aria-label="Close dialogue"
        >
          ×
        </button>
        <div className="np-dialogue-main">
          <NpcPortrait portraitIndex={npc.portraitIndex} name={npc.name} />
          <div className="np-dialogue-copy">
            <div className="np-dialogue-role">{npc.title}</div>
            <h2>{npc.name}</h2>
            <p aria-live="off">
              {message.slice(0, shown)}
              {shown < message.length && <span className="np-caret" aria-hidden="true">▍</span>}
            </p>
            {npc.note && <p className="np-dialogue-note">{npc.note}</p>}
          </div>
        </div>
        <div className="np-dialogue-actions">
          <button
            type="button"
            className="np-dialogue-later"
            onClick={handleClose}
            onMouseEnter={() => sound.playBlip()}
          >
            Not now
          </button>
          <button
            type="button"
            className="np-dialogue-enter"
            onClick={continueToPage}
            onMouseEnter={() => sound.playBlip()}
          >
            {shown < message.length ? 'Skip text' : npc.actionLabel || 'Explore'} <span aria-hidden="true">➜</span>
          </button>
        </div>
      </section>
    </div>
  );
}
