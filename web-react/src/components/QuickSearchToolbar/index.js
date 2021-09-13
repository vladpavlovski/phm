import React from 'react'
import PropTypes from 'prop-types'
import {
  GridColumnsToolbarButton,
  GridDensitySelector,
  GridFilterToolbarButton,
  GridToolbarExport,
} from '@material-ui/x-grid'
import ClearIcon from '@material-ui/icons/Clear'
import SearchIcon from '@material-ui/icons/Search'
import IconButton from '@material-ui/core/IconButton'
import TextField from '@material-ui/core/TextField'

const QuickSearchToolbar = props => {
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
      <div>
        <GridColumnsToolbarButton />
        <GridFilterToolbarButton />
        <GridDensitySelector />
        <GridToolbarExport />
      </div>
      <TextField
        variant="standard"
        value={props.value}
        onChange={props.onChange}
        placeholder="Search…"
        InputProps={{
          startAdornment: <SearchIcon fontSize="small" />,
          endAdornment: (
            <IconButton
              title="Clear"
              aria-label="Clear"
              size="small"
              style={{ visibility: props.value ? 'visible' : 'hidden' }}
              onClick={props.clearSearch}
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          ),
        }}
      />
    </div>
  )
}

QuickSearchToolbar.propTypes = {
  clearSearch: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
}

export { QuickSearchToolbar }
