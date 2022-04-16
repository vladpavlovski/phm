import React from 'react'
import { ChromePicker, ChromePickerProps, Color } from 'react-color'

type TPickerDialog = ChromePickerProps & {
  value: Color
  onClick: () => void
}

const PickerDialog: React.FC<TPickerDialog> = ({
  value,
  onClick,
  onChange,
}) => (
  <div style={{ position: 'relative' }}>
    <div style={{ position: 'absolute', zIndex: 2 }}>
      <div
        style={{
          position: 'fixed',
          top: '0px',
          right: '0px',
          bottom: '0px',
          left: '0px',
        }}
        onClick={onClick}
      />
      <ChromePicker color={value} onChange={onChange} />
    </div>
  </div>
)

export default PickerDialog
