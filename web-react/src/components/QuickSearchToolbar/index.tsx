import React from 'react'

import {
  GridToolbarColumnsButton,
  GridToolbarExport,
  GridToolbarDensitySelector,
  GridToolbarFilterButton,
  GridCsvExportOptions,
  GridToolbarExportProps,
} from '@mui/x-data-grid-pro'
import ClearIcon from '@mui/icons-material/Clear'
import SearchIcon from '@mui/icons-material/Search'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'

interface TQuickSearchToolbar extends GridToolbarExportProps {
  hideButtons: boolean
  value: string
  onChange: () => void
  clearSearch: () => void
  csvOptions?: GridCsvExportOptions
}

const QuickSearchToolbar: React.FC<TQuickSearchToolbar> = props => {
  const { hideButtons, value, onChange, clearSearch } = props
  return (
    <div
      style={{
        padding: '4px 4px 0',
        justifyContent: 'space-between',
        display: 'flex',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
      }}
    >
      {!hideButtons && (
        <div>
          <GridToolbarColumnsButton />
          <GridToolbarFilterButton />
          <GridToolbarDensitySelector />
          <GridToolbarExport />
        </div>
      )}
      <TextField
        variant="standard"
        value={value}
        onChange={onChange}
        placeholder="Search…"
        InputProps={{
          startAdornment: <SearchIcon fontSize="small" />,
          endAdornment: (
            <IconButton
              title="Clear"
              aria-label="Clear"
              size="small"
              style={{ visibility: value ? 'visible' : 'hidden' }}
              onClick={clearSearch}
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          ),
        }}
      />
    </div>
  )
}

QuickSearchToolbar.defaultProps = {
  hideButtons: false,
}

export { QuickSearchToolbar }
