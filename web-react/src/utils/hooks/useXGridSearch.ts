import * as JsSearch from 'js-search'
import React from 'react'
import { useDebounce } from 'utils/hooks'
import { GridRowsProp } from '@mui/x-data-grid-pro'

type TUseXGridSearch = {
  searchIndexes: (string | string[])[]
  data: GridRowsProp[]
}

const useXGridSearch = (
  props: TUseXGridSearch
): [string, GridRowsProp[], React.Dispatch<React.SetStateAction<string>>] => {
  const { searchIndexes, data } = props
  const [searchDataEngine] = React.useState<JsSearch.Search>(
    new JsSearch.Search('id')
  )
  const [isInitialization, setIsInitialization] = React.useState(true)

  React.useEffect(() => {
    if (isInitialization) {
      searchDataEngine.indexStrategy = new JsSearch.AllSubstringsIndexStrategy()

      setIsInitialization(false)
    }
  }, [])

  React.useEffect(() => {
    searchIndexes?.forEach(si => {
      searchDataEngine.addIndex(si)
    })
  }, [searchIndexes])

  const [searchText, setSearchText] = React.useState<string>('')
  const [searchData, setSearchData] = React.useState<GridRowsProp[]>([])
  const debouncedSearch = useDebounce(searchText, 500)

  // const requestSearch = React.useCallback(setSearchText, [])

  React.useEffect(() => {
    // search on user input
    const filteredRows = searchDataEngine.search(
      debouncedSearch
    ) as GridRowsProp[]
    const newSearchData = debouncedSearch === '' ? data : filteredRows
    setSearchData(newSearchData)
  }, [debouncedSearch, data])

  React.useEffect(() => {
    // adding new data if initial data set changed
    setSearchData(data)
    searchDataEngine.addDocuments(data)
  }, [data])

  return [searchText, searchData, setSearchText]
}

export { useXGridSearch }
