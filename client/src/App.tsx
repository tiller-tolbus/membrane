import React, { useEffect, useState } from 'react'
import {
  ReactGrid,
  Column,
  Row,
  CellChange,
  TextCell,
  Id
} from '@silevis/reactgrid'
import '@silevis/reactgrid/styles.css'
import './grid-custom-styles.css'
import Urbit from '@urbit/http-api'
import _ from 'lodash'
//mui
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'

import jsonSpec from './spec2.json'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

const ROW_COUNT = 1000

const initalColumns = [
  '',
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z'
]
const getColumns = () => {
  return initalColumns.map((text, index) => {
    return { columnId: index, columnName: text, width: 100 }
  })
}

const getRows = () => {
  //main app data is returned here
  //make the intial rows, i.e the first row from columns
  const initialRow = [
    {
      rowId: 'header',
      cells: initalColumns.map(col => {
        return { type: 'header', text: col }
      })
    }
  ]
  //generate 1000 new rows
  return generateRows(ROW_COUNT, initialRow)
}

const applyChangesToCell = (changes, prevRows) => {
  //use the changes object to directly access the correct cell and update it using the new text!
  const { rowId, columnId, newCell } = changes[0]
  let newRows = [...prevRows]
  newRows[rowId].cells[columnId].text = newCell.text
  return newRows
}

// a helper function used to reorder arbitrary arrays
const reorderArray = <T extends {}>(arr: T[], idxs: number[], to: number) => {
  const movedElements = arr.filter((_, idx) => idxs.includes(idx))
  const targetIdx =
    Math.min(...idxs) < to
      ? (to += 1)
      : (to -= idxs.filter(idx => idx < to).length)
  const leftSide = arr.filter(
    (_, idx) => idx < targetIdx && !idxs.includes(idx)
  )
  const rightSide = arr.filter(
    (_, idx) => idx >= targetIdx && !idxs.includes(idx)
  )
  return [...leftSide, ...movedElements, ...rightSide]
}

const generateRows = (rowCount, oldRows) => {
  //make a copy of the old rows
  const newRows = [...oldRows]
  //establish the number of columns
  const colCount = newRows[0].cells.length
  //add x rows (rowCount)
  for (let i = 0; i < rowCount; i++) {
    let cells = []
    //make the cells using colCount
    for (let colIndex = 0; colIndex < colCount; colIndex++) {
      //if it's a first cell, insert the row count else just have an empty string
      let content = colIndex > 0 ? '' : newRows.length.toString()
      cells.push({ type: 'text', text: content })
    }
    //insert the id of the new row and insert the row
    newRows.push({
      rowId: newRows.length,
      cells
    })
  }
  return newRows
}
const dataToJson = data => {
  //take the displayed data(rows) and transform it into what the back-end expects
  //returns json
  const specData = data.map((item, index) => {
    return item.cells.map(item => {
      return item.text
    })
  })

  return JSON.stringify(specData)
}
const jsonToData = json => {
  //take parsed json and turn it into something client can use
  //returns rows and columns

  //these are our columns
  const columns = json[0].map((text, index) => {
    return { columnId: index, columnName: text }
  })
  //these are our rows (includes columns) (final data passed to react grid)
  const rows = json.map((row, index) => {
    //first entry here is the column
    if (index === 0) {
      return {
        rowId: 'header',
        cells: row.map(col => {
          return { type: 'header', text: col }
        })
      }
    }
    return {
      rowId: index,
      cells: row.map(item => {
        return { type: 'text', text: item }
      })
    }
  })

  return { rows, columns }
}
const createApi = _.memoize(() => {
  //TODO switch to authenticate
  /**
     * All-in-one hook-me-up.
     *
     * Given a ship, url, and code, this returns an airlock connection
     * that is ready to go. It `|hi`s itself to create the channel,
     * then opens the channel via EventSource.
     *
    
    static authenticate({ ship, url, code, verbose, }: AuthenticationInterface): Promise<Urbit>;
     */
  //connect to urbit and return the urbit instance
  const urb = new Urbit('http://localhost:80', 'lidlut-tabwed-pillex-ridrup')
  urb.ship = 'zod'
  urb.onError = message => console.log(message) // Just log errors if we get any
  //urb.subscribe(subscription) // You can call urb.subscribe(...) as many times as you want to different subscriptions
  urb.connect()
  return urb
})
function App () {
  /*URBIT STUFF HERE */
  // By default, we aren't connected. We need to verify
  const [connected, setConnected] = useState<boolean>(false)
  //create urbit api instance
  const api = createApi()
  const getGraphKeys = async () => {
    // If unconnected, check if we can access resources
    if (!connected) {
      const graphKeys = await api.scry({ app: 'graph-store', path: '/keys' })
      console.log('graphKeys', graphKeys)
      // If graphKeys unavailable, the scry failed and the onError handler takes it from here.
      if (!graphKeys) {
        return
      }

      // Otherwise, we are in business.
      setConnected(true)
    }
  }
  api.onError = (message: Error) => {
    setConnected(false)
    if (message.message === 'NetworkError when attempting to fetch resource.') {
      console.log(
        `Host unavailable. You may need to run |cors-approve ${window.location.origin}.`
      )
    }
  }
  /* REACT GRID STUFF HERE */
  const [columns, setColumns] = useState([])
  const [rows, setRows] = useState([])
  /* const handleRowsReorder = (targetRowId: Id, rowIds: Id[]) => {
    setPeople(prevRows => {
      const to = people.findIndex(person => person.id === targetRowId)
      const rowsIds = rowIds.map(id =>
        people.findIndex(person => person.id === id)
      )
      return reorderArray(prevRows, rowsIds, to)
    })
  }*/
  const handleColumnsReorder = (targetColumnId: Id, columnIds: Id[]) => {
    const to = columns.findIndex(column => column.columnId === targetColumnId)
    const columnIdxs = columnIds.map(columnId =>
      columns.findIndex(c => c.columnId === columnId)
    )
    setColumns(prevColumns => reorderArray(prevColumns, columnIdxs, to))
  }
  const handleColumnResize = (ci: Id, width: number) => {
    setColumns(prevColumns => {
      const columnIndex = prevColumns.findIndex(el => el.columnId === ci)
      const resizedColumn = prevColumns[columnIndex]
      const updatedColumn = { ...resizedColumn, width }
      prevColumns[columnIndex] = updatedColumn
      return [...prevColumns]
    })
  }

  const handleChanges = (changes: CellChange<TextCell>[]) => {
    //setting rows directly and updating the rows in state with the data (didn't want to do this but this is how the library works)
    setRows(prevRows => applyChangesToCell(changes, prevRows))
  }
  const handleCanReorderRows = (targetRowId: Id, rowIds: Id[]): boolean => {
    return targetRowId !== 'header'
  }
  useEffect(() => {
    //use the json file to generate our rows and columns
    //simulates and actual api call for now
    //otherwise we can use getRows and getColumns directly
    // const { columns, rows } = jsonToData(jsonSpec)
    //update our state with the values
    setColumns(getColumns())
    setRows(getRows())
    //our first scry? tries to get resources from urbit(check connectivity?)
    getGraphKeys()
  }, [])

  /*if (!connected) {
    return <div className='App'>Unconnected</div>
  }*/
  function isInDesiredForm (str) {
    return /^\+?(0|[1-9]\d*)$/.test(str)
  }
  return (
    <main>
      <Stack marginY={'1em'} direction='row' justifyContent={'space-between'}>
        <Stack direction='row' spacing={1} alignItems='center'>
          <Typography variant='h4'>Cell</Typography>
          <Typography variant='h5'>a spreadsheet app for urbit</Typography>
        </Stack>
        <Button
          variant='contained'
          onClick={() => {
            setRows(oldRows => generateRows(ROW_COUNT, oldRows))
          }}
        >
          Sync with urbit
        </Button>
      </Stack>
      <div className={'grid-container'}>
        <ReactGrid
        
          rows={rows}
          columns={columns}
          onCellsChanged={handleChanges}
          stickyTopRows={1}
          stickyLeftColumns={1}
          /*  
          onColumnResized={handleColumnResize}
        onColumnsReordered={handleColumnsReorder}
        onRowsReordered={handleRowsReorder}
        */
          enableRowSelection
          enableColumnSelection
          canReorderRows={handleCanReorderRows}
        />
      </div>
      <Stack
        sx={{ marginTop: '1em' }}
        direction='row'
        spacing={2}
        alignItems='center'
      >
        <Button
          variant='contained'
          onClick={() => {
            setRows(oldRows => generateRows(ROW_COUNT, oldRows))
          }}
        >
          Add
        </Button>
        <TextField
          hiddenLabel
          id='outlined-number'
          type='number'
          size='small'
          variant='standard'
          value={'1000'}
          InputLabelProps={{
            shrink: true
          }}
        />

        <p>more rows</p>
      </Stack>
    </main>
  )
}

export default App
