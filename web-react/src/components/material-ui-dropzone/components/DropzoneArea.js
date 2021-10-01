import * as React from 'react'

import { createFileFromUrl, readFile } from '../helpers'

import DropzoneAreaBase from './DropzoneAreaBase'

const splitDropzoneAreaProps = props => {
  const {
    clearOnUnmount,
    initialFiles,
    onChange,
    onDelete,
    ...dropzoneAreaProps
  } = props
  return [
    { clearOnUnmount, initialFiles, onChange, onDelete },
    dropzoneAreaProps,
  ]
}

/**
 * This components creates an uncontrolled Material-UI Dropzone, with previews and snackbar notifications.
 *
 * It supports all props of `DropzoneAreaBase` but keeps the files state internally.
 *
 * **Note** To listen to file changes use `onChange` event handler and notice that `onDelete` returns a `File` instance instead of `FileObject`.
 */
class DropzoneArea extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      fileObjects: [],
    }
  }

  componentDidMount() {
    this.loadInitialFiles()
  }

  componentWillUnmount() {
    const { clearOnUnmount } = this.props

    if (clearOnUnmount) {
      this.setState(
        {
          fileObjects: [],
        },
        this.notifyFileChange
      )
    }
  }

  notifyFileChange() {
    const { onChange } = this.props
    const { fileObjects } = this.state

    if (onChange) {
      onChange(fileObjects.map(fileObject => fileObject.file))
    }
  }

  async loadInitialFiles() {
    const { initialFiles } = this.props
    try {
      const fileObjs = await Promise.all(
        initialFiles.map(async initialFile => {
          let file
          if (typeof initialFile === 'string') {
            file = await createFileFromUrl(initialFile)
          } else {
            file = initialFile
          }
          const data = await readFile(file)

          return {
            file,
            data,
          }
        })
      )

      this.setState(
        state => ({
          fileObjects: [].concat(state.fileObjects, fileObjs),
        }),
        this.notifyFileChange
      )
    } catch (err) {
      console.log(err)
    }
  }

  async addFiles(newFileObjects) {
    const { filesLimit } = this.props
    // Update component state
    this.setState(state => {
      // Handle a single file
      if (filesLimit <= 1) {
        return {
          fileObjects: [].concat(newFileObjects[0]),
        }
      }

      // Handle multiple files
      return {
        fileObjects: [].concat(state.fileObjects, newFileObjects),
      }
    }, this.notifyFileChange)
  }

  deleteFile(removedFileObj, removedFileObjIdx) {
    event.stopPropagation()

    const { onDelete } = this.props
    const { fileObjects } = this.state

    // Calculate remaining fileObjects array
    const remainingFileObjs = fileObjects.filter((fileObject, i) => {
      return i !== removedFileObjIdx
    })

    // Notify removed file
    if (onDelete) {
      onDelete(removedFileObj.file)
    }

    // Update local state
    this.setState(
      {
        fileObjects: remainingFileObjs,
      },
      this.notifyFileChange
    )
  }

  render() {
    const [, dropzoneAreaProps] = splitDropzoneAreaProps(this.props)
    const { fileObjects } = this.state

    return (
      <DropzoneAreaBase
        {...dropzoneAreaProps}
        fileObjects={fileObjects}
        onAdd={this.addFiles}
        onDelete={this.deleteFile}
      />
    )
  }
}

export default DropzoneArea
