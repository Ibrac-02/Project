import { useState, useCallback } from 'react'
import Cropper, { type Area } from 'react-easy-crop'

export type ImageCropperProps = {
  imageSrc: string
  onCancel: () => void
  onConfirm: (result: { croppedAreaPixels: Area; rotation: number }) => void
  aspect?: number // e.g., 16/9
}

export default function ImageCropper({ imageSrc, onCancel, onConfirm, aspect = 16 / 9 }: ImageCropperProps) {
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  const onCropComplete = useCallback((_croppedArea: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels)
  }, [])

  return (
    <div style={styles.backdrop}>
      <div style={styles.modal}>
        <div style={{ position: 'relative', width: '100%', height: 360, background: '#111' }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropComplete}
            objectFit="contain"
          />
        </div>

        <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
          <label className="sb-label">Zoom</label>
          <input type="range" min={1} max={3} step={0.1} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} />

          <label className="sb-label">Rotation</label>
          <input type="range" min={0} max={270} step={90} value={rotation} onChange={(e) => setRotation(Number(e.target.value))} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
          <button className="sb-btn" onClick={onCancel}>Cancel</button>
          <button
            className="sb-btn sb-btn-primary"
            onClick={() => {
              if (!croppedAreaPixels) return
              onConfirm({ croppedAreaPixels, rotation })
            }}
          >
            Apply Crop
          </button>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  backdrop: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  modal: {
    width: 'min(92vw, 720px)', background: 'var(--sb-surface)', borderRadius: 12, padding: 16, boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
  },
}
