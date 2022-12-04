import { TImportExplanation } from 'admin/pages/Import/importTypes'
import { LinkButton, Title } from 'components'
import React from 'react'
import {
  Box,
  Card,
  CardActions,
  CardContent,
  Collapse,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  Typography,
} from '@mui/material'

type Props = {
  data: TImportExplanation
}
export const Explanations = ({ data }: Props) => {
  const [checked, setChecked] = React.useState(false)

  const handleChange = () => {
    setChecked(prev => !prev)
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Box>
        <Title>
          Explanations{' '}
          <FormControlLabel
            control={<Switch checked={checked} onChange={handleChange} />}
            label=""
          />
        </Title>

        <Collapse in={checked}>
          <Box>
            <Typography sx={{ mb: 2 }}>{data.description}</Typography>
            <Stack direction="row" spacing={2}>
              {data.explanations.map((explanation, index) => (
                <Card
                  key={index}
                  sx={{
                    maxWidth: 275,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="h2">
                      {explanation.title}
                    </Typography>
                    <Typography>{explanation.description}</Typography>
                  </CardContent>
                  {explanation.link && (
                    <CardActions>
                      <LinkButton
                        to={explanation.link}
                        target="_blank"
                        size="small"
                      >
                        View
                      </LinkButton>
                    </CardActions>
                  )}
                </Card>
              ))}
            </Stack>
          </Box>
        </Collapse>
      </Box>
    </Paper>
  )
}
