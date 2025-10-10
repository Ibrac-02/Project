type Props = {
  open: boolean
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  confirmVariant?: 'primary' | 'danger'
}

export default function ConfirmModal({ open, title = 'Confirm', message = 'Are you sure?', confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onCancel, confirmVariant = 'primary' }: Props) {
  if (!open) return null
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div style={{ display: 'grid', gap: 8 }}>
          <div style={{ fontWeight: 600, fontSize: 16 }}>{title}</div>
          <div className="muted">{message}</div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <button className="sb-btn" onClick={onCancel}>{cancelText}</button>
            <button className={`sb-btn ${confirmVariant === 'danger' ? 'sb-btn-danger' : 'sb-btn-primary'}`} onClick={onConfirm}>{confirmText}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
