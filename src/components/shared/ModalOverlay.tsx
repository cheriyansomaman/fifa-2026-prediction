import type { CSSProperties, ReactNode } from 'react';

interface ModalOverlayProps {
  onClose: () => void;
  children: ReactNode;
  borderColor?: string;
  maxWidth?: number;
  scrollable?: boolean;
  boxStyle?: CSSProperties;
}

export function ModalOverlay({
  onClose,
  children,
  borderColor = '#1e3a5f',
  maxWidth = 420,
  scrollable = false,
  boxStyle,
}: ModalOverlayProps) {
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="modal-overlay"
      onClick={handleBackdrop}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 16,
        ...(scrollable ? { overflowY: 'auto' } : {}),
      }}
    >
      <div
        className="modal-box"
        style={{
          background: '#0a1628',
          border: `1.5px solid ${borderColor}55`,
          borderRadius: 16,
          padding: 28,
          width: '100%',
          maxWidth,
          ...(scrollable ? { maxHeight: '90vh', overflowY: 'auto' } : {}),
          ...boxStyle,
        }}
      >
        {children}
      </div>
    </div>
  );
}
