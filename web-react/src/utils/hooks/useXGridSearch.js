import React from 'react'
import PropTypes from 'prop-types'
import { stemmer } from 'porter-stemmer'

import * as JsSearch from 'js-search'
import { useDebounce } from 'utils/hooks'

const searchDataEngine = new JsSearch.Search('id')
searchDataEngine.indexStrategy = new JsSearch.AllSubstringsIndexStrategy()

searchDataEngine.tokenizer = new JsSearch.StemmingTokenizer(
  stemmer,
  new JsSearch.SimpleTokenizer()
)
const useXGridSearch = props => {
  const { searchIndexes, data } = props

  React.useEffect(() => {
    searchIndexes?.forEach(si => {
      searchDataEngine.addIndex(si)
    })
  }, [searchIndexes])

  const [searchText, setSearchText] = React.useState('')
  const [searchData, setSearchData] = React.useState([])
  const debouncedSearch = useDebounce(searchText, 500)

  const requestSearch = React.useCallback(searchValue => {
    setSearchText(searchValue)
  }, [])

  React.useEffect(() => {
    // search on user input
    const filteredRows = searchDataEngine.search(debouncedSearch)
    setSearchData(debouncedSearch === '' ? data : filteredRows)
  }, [debouncedSearch, data])

  React.useEffect(() => {
    // adding new data if initial data set changed
    setSearchData(data)
    searchDataEngine.addDocuments(data)
  }, [data])

  return [searchText, searchData, requestSearch]
}

useXGridSearch.defaultProps = {
  searchIndexes: [],
  data: [],
}

useXGridSearch.propTypes = {
  searchIndexes: PropTypes.array,
  data: PropTypes.array,
}

export { useXGridSearch }
