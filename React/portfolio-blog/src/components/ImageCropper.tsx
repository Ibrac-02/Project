import { useState, useCallback } from 'react';
import React from 'react';
import Cropper from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';
import { FiX, FiCheck, FiRotateCw, FiZoomIn, FiZoomOut } from 'react-icons/fi';

interface Point {
  x: number;
  y: number;
}

interface Area {
  width: number;
  height: number;
  x: number;
  y: number;
}

type ImageCropperProps = {
  imageSrc: string;
  onCancel: () => void;
  onConfirm: (result: { croppedAreaPixels: Area; rotation: number }) => void;
  aspect?: number;
};

export default function ImageCropper({ 
  imageSrc, 
  onCancel, 
  onConfirm, 
  aspect = 4/3 
}: ImageCropperProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleConfirm = () => {
    if (croppedAreaPixels) {
      onConfirm({ croppedAreaPixels, rotation });
    }
  };

  return (
    <div style={styles.backdrop}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <button onClick={onCancel} style={styles.closeButton}>
            <FiX size={24} />
          </button>
          <h3 style={styles.title}>Adjust Photo</h3>
          <button 
            onClick={handleConfirm} 
            style={styles.confirmButton}
            disabled={!croppedAreaPixels}
          >
            <FiCheck size={24} />
          </button>
        </div>
        
        <div style={styles.cropContainer}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            objectFit="contain"
            showGrid={false}
            restrictPosition
          />
        </div>

        <div style={styles.controls}>
          <div style={styles.sliderContainer}>
            <FiZoomOut size={20} style={styles.sliderIcon} />
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                style={styles.slider}
              />
              <div style={{ 
                position: 'absolute', 
                top: '6px', 
                left: 0, 
                right: 0 
              }}>
                <div style={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: '#00a884',
                  cursor: 'pointer',
                  position: 'absolute',
                  left: `calc(${(zoom - 1) * 50}% - 8px)`,
                  top: -6
                }} />
              </div>
            </div>
            <FiZoomIn size={20} style={styles.sliderIcon} />
          </div>

          <button 
            onClick={() => setRotation((prev) => (prev + 90) % 360)}
            style={styles.rotateButton}
          >
            <FiRotateCw size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: 16,
  },
  modal: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    padding: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid #333',
  },
  title: {
    margin: 0,
    fontSize: 18,
    fontWeight: 600,
    color: '#fff',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    padding: 8,
  },
  confirmButton: {
    background: 'none',
    border: 'none',
    color: '#00a884',
    cursor: 'pointer',
    padding: 8,
    fontWeight: 600,
    fontSize: 16,
  },
  cropContainer: {
    position: 'relative',
    width: '100%',
    height: '60vh',
    backgroundColor: '#000',
  },
  controls: {
    padding: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e1e1e',
  },
  sliderContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  sliderIcon: {
    color: '#fff',
  },
  slider: {
    flex: 1,
    WebkitAppearance: 'none',
    height: 4,
    borderRadius: 2,
    background: '#555',
    outline: 'none',
  },
  rotateButton: {
    background: 'none',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    padding: 8,
    marginLeft: 16,
  },
};
