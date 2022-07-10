import { TitleDivider } from 'admin/pages/Game/play/components/eventTypeForms/components'
import React from 'react'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

type Props = {
  data: any[]
  onClick: (p: any) => void
  selected: any
  title?: string
}

const GridButtonSelect: React.FC<Props> = props => {
  const { data, onClick, selected, title } = props
  return (
    <div style={{ width: '100%' }}>
      <TitleDivider title={title} />
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          minWidth: 300,
          width: '100%',
          justifyContent: 'space-evenly',
        }}
      >
        {data.map(type => (
          <Button
            key={type.name}
            onClick={() => {
              onClick(type)
            }}
            type="button"
            variant={selected?.code === type?.code ? 'outlined' : 'contained'}
            sx={{ minWidth: '180px', m: 1 }}
          >
            <Typography variant="body1" component="div">
              {type.name}
            </Typography>
          </Button>
        ))}
      </div>
    </div>
  )
}

export { GridButtonSelect }
