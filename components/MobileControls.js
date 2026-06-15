'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

export default function MobileControls({ onMove, onAction, onLook }) {
  const [activeJoystick, setActiveJoystick] = useState(null);
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const joystickRef = useRef(null);
  const isMobile = typeof window !== 'undefined' && 'ontouchstart' in window;

  if (!isMobile) return null;

  const handleJoystickStart = (e) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    setActiveJoystick(true);
  };

  const handleJoystickMove = useCallback((e) => {
    if (!activeJoystick) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStart.x;
    const dy = touch.clientY - touchStart.y;
    
    const maxDist = 50;
    const dist = Math.min(Math.sqrt(dx*dx + dy*dy), maxDist);
    const angle = Math.atan2(dy, dx);
    
    setJoystickPos({
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
    });

    // Normalize movement
    const normX = Math.cos(angle) * (dist / maxDist);
    const normY = Math.sin(angle) * (dist / maxDist);
    
    if (onMove) {
      onMove({
        forward: normY < -0.2,
        backward: normY > 0.2,
        left: normX < -0.2,
        right: normX > 0.2,
      });
    }
  }, [activeJoystick, touchStart, onMove]);

  const handleJoystickEnd = () => {
    setActiveJoystick(false);
    setJoystickPos({ x: 0, y: 0 });
    if (onMove) {
      onMove({ forward: false, backward: false, left: false, right: false });
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 0, left: 0, right: 0, top: 0,
      zIndex: 60,
      pointerEvents: 'none',
      fontFamily: "'Rajdhani', sans-serif",
    }}>
      {/* Left Joystick */}
      <div style={{
        position: 'absolute',
        bottom: 120,
        left: 40,
        width: 120,
        height: 120,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.08)',
        border: '2px solid rgba(255,255,255,0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'auto',
        touchAction: 'none',
      }}
        onTouchStart={handleJoystickStart}
        onTouchMove={handleJoystickMove}
        onTouchEnd={handleJoystickEnd}
      >
        <div style={{
          width: 50,
          height: 50,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.15)',
          transform: `translate(${joystickPos.x}px, ${joystickPos.y}px)`,
          transition: activeJoystick ? 'none' : 'transform 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(255,255,255,0.2)',
        }}>
          <span style={{ color: '#666', fontSize: 10 }}>MOVE</span>
        </div>
      </div>

      {/* Right Action Buttons */}
      <div style={{
        position: 'absolute',
        bottom: 180,
        right: 40,
        display: 'flex',
        gap: 15,
        pointerEvents: 'auto',
      }}>
        {/* Attack Button */}
        <button
          onTouchStart={() => onAction?.('attack')}
          style={{
            width: 70,
            height: 70,
            borderRadius: '50%',
            background: 'rgba(255,0,0,0.3)',
            border: '2px solid rgba(255,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ff4444',
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: 1,
            cursor: 'pointer',
          }}
        >
          ATTACK
        </button>
      </div>

      <div style={{
        position: 'absolute',
        bottom: 100,
        right: 40,
        display: 'flex',
        gap: 10,
        pointerEvents: 'auto',
      }}>
        {/* Reload Button */}
        <button
          onTouchStart={() => onAction?.('reload')}
          style={{
            width: 55,
            height: 55,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ccc',
            fontSize: 11,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          RELOAD
        </button>
        {/* Heal Button */}
        <button
          onTouchStart={() => onAction?.('heal')}
          style={{
            width: 55,
            height: 55,
            borderRadius: '50%',
            background: 'rgba(0,255,0,0.08)',
            border: '1px solid rgba(0,255,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#4f4',
            fontSize: 11,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          HEAL
        </button>
      </div>

      {/* Weapon Switch */}
      <div style={{
        position: 'absolute',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 5,
        pointerEvents: 'auto',
      }}>
        {[1, 2, 3, 4].map(i => (
          <button
            key={i}
            onTouchStart={() => onAction?.('weapon', i - 1)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#888',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {i}
          </button>
        ))}
      </div>

      {/* Map Button */}
      <div style={{
        position: 'absolute',
        top: 100,
        right: 20,
        pointerEvents: 'auto',
      }}>
        <button
          onTouchStart={() => onAction?.('map')}
          style={{
            width: 50,
            height: 50,
            borderRadius: 12,
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ccc',
            fontSize: 20,
            cursor: 'pointer',
          }}
        >
          🗺️
        </button>
      </div>

      {/* Pause Button */}
      <div style={{
        position: 'absolute',
        top: 20,
        right: 20,
        pointerEvents: 'auto',
      }}>
        <button
          onTouchStart={() => onAction?.('pause')}
          style={{
            width: 45,
            height: 45,
            borderRadius: 10,
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ccc',
            fontSize: 16,
            cursor: 'pointer',
          }}
        >
          ⏸
        </button>
      </div>
    </div>
  );
}