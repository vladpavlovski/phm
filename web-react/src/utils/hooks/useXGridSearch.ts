import React from 'react'
import { GridRowsProp } from '@mui/x-data-grid-pro'
import * as JsSearch from 'js-search'
import { useDebounce } from 'utils/hooks'

const searchDataEngine = new JsSearch.Search('id')
searchDataEngine.indexStrategy = new JsSearch.AllSubstringsIndexStrategy()

type TUseXGridSearch = {
  searchIndexes: string[]
  data: GridRowsProp[]
}

const useXGridSearch = (props: TUseXGridSearch) => {
  const { searchIndexes, data } = props

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

  return [searchText, searchData, setSearchText] as const
}

export { useXGridSearch }