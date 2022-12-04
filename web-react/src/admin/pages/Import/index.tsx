import { Explanations } from 'admin/pages/Import/components/Explanations'
import { RowIndicator } from 'admin/pages/Import/components/RowIndicator'
import { getImportTypes } from 'admin/pages/Import/importTypes'
import { Title } from 'components/Title'
import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useParams } from 'react-router'
import Spreadsheet, { createEmptyMatrix } from 'react-spreadsheet'
import { CleaningServicesOutlined } from '@mui/icons-material'
import FactCheckIcon from '@mui/icons-material/FactCheck'
import { Button, ButtonGroup, Container, Grid, Paper, Stack, Toolbar } from '@mui/material'

export enum IMPORT_TYPE {
  player = 'player',
  game = 'game',
}

const DEFAULT_SELECTED_TYPE = IMPORT_TYPE.player

const prepareDataForImport = (
  worksheet: { value: string }[][],
  columns: string[]
): { [key: string]: string }[] => {
  const data = worksheet
    .filter(row => !!row[0])
    .map(row => {
      const obj: { [key: string]: string } = {}
      row.forEach((cell, index) => {
        if (columns[index]) {
          obj[columns[index]] = cell.value
        }
      })
      return obj
    })
  return data
}

const ImportData = () => {
  const { organizationSlug } = useParams<{ organizationSlug: string }>()
  const importTypes = getImportTypes({ organizationSlug })

  const [spreadsheetData, setSpreadsheetData] = useState<any[]>(
    createEmptyMatrix(10, importTypes[DEFAULT_SELECTED_TYPE].columns.length)
  )

  const [importType, setImportType] = useState<IMPORT_TYPE>(
    DEFAULT_SELECTED_TYPE
  )
  const [preparedData, setPreparedData] = useState<{ [key: string]: string }[]>(
    []
  )

  const handleImportTypeChange = (type: IMPORT_TYPE) => {
    setImportType(type)

    setSpreadsheetData(createEmptyMatrix(10, importTypes[type].columns.length))
  }

  const clearSpreadsheet = () => {
    setSpreadsheetData(
      createEmptyMatrix(10, importTypes[importType].columns.length)
    )
  }
  const getButtonVariant = (type: IMPORT_TYPE) => {
    return type === importType ? 'contained' : 'outlined'
  }

  const prepareData = () => {
    const data = prepareDataForImport(
      spreadsheetData,
      importTypes[importType].columns
    )
    setPreparedData(data)
  }

  return (
    <Container maxWidth={false}>
      <Helmet>
        <title>{'Import Data'}</title>
      </Helmet>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper>
            <Toolbar>
              <Stack direction="row" spacing={2} justifyItems="center">
                <Title>{'Import Data'}</Title>
                <ButtonGroup variant="outlined" size="small">
                  <Button
                    disabled={importType === IMPORT_TYPE.player}
                    variant={getButtonVariant(importType)}
                    onClick={() => {
                      handleImportTypeChange(IMPORT_TYPE.player)
                    }}
                  >
                    Players
                  </Button>
                </ButtonGroup>
              </Stack>
            </Toolbar>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper>
            <Toolbar>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<FactCheckIcon />}
                  onClick={() => {
                    prepareData()
                  }}
                >
                  Prepare Data for Upload
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CleaningServicesOutlined />}
                  onClick={() => {
                    clearSpreadsheet()
                  }}
                >
                  Clear
                </Button>
              </Stack>
            </Toolbar>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Explanations data={importTypes[importType].explanation} />
        </Grid>

        <Grid item xs={12}>
          <Paper>
            <Spreadsheet
              RowIndicator={({ row, ...rest }) => (
                <RowIndicator
                  {...rest}
                  row={row}
                  data={preparedData?.[row]}
                  importType={importType}
                />
              )}
              data={spreadsheetData}
              onChange={setSpreadsheetData}
              columnLabels={importTypes[importType].columns}
            />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}

export { ImportData as default }
