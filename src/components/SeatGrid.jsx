import React from 'react'

export default function SeatGrid({grid, setGrid, rows, cols, onDropData, onLockToggle, onEmptySeat}){
  function handleCellClick(i, e){
    const g = [...grid];
    if(e.shiftKey){
      g[i].locked = !g[i].locked;
      setGrid(g)
      // 若該格有學生，鎖定時設定學生狀態為 "lock"，解鎖則設定為 "assigned"
      if(g[i].name && typeof onLockToggle === 'function'){
        onLockToggle(g[i].name, g[i].locked)
      }
    } else {
      // 取得原本的學生名稱
      const studentName = g[i].name;
      g[i].empty = !g[i].empty;
      if(g[i].empty){
        if(studentName && typeof onEmptySeat === 'function'){
          onEmptySeat(studentName)
        }
        g[i].name = null;
      }
      setGrid(g)
    }
  }

  function handleDragStart(e, i){
    const cell = grid[i]
    if(cell.name){
      e.dataTransfer.setData('data-type', 'seat')
      e.dataTransfer.setData('seat-index', i)
      e.dataTransfer.setData('seat-name', cell.name)
    }
  }

  function handleDrop(e, i){
    e.preventDefault()
    const type = e.dataTransfer.getData('data-type')
    const name = e.dataTransfer.getData('data-value') || e.dataTransfer.getData('seat-name')
    const fromIndex = e.dataTransfer.getData('seat-index')
    if(!name) return
    onDropData({ type, value: name, index: fromIndex ? Number(fromIndex) : null }, i)
  }

  return (
    <div style={{
      display:'grid', 
      gridTemplateColumns:`repeat(${cols}, minmax(90px,240px))`,
      gap:8,
      maxWidth: cols*130, 
      className:'w-80 h-70'
    }}>
      {grid.map((cell, i) => (
        <div key={i}
          draggable={!!cell.name}
          onDragStart={(e)=>handleDragStart(e,i)}
          onDrop={(e)=>handleDrop(e,i)}
          onDragOver={e=>e.preventDefault()}
          onClick={(e)=>handleCellClick(i,e)}
          style={{
            height:70,
            border:'1px solid #ccc',
            borderRadius:8,
            display:'flex',
            alignItems:'center',
            justifyContent:'center',
            background: cell.empty ? '#f5f5f5' : (cell.locked ? '#dff0d8' : '#fff'),
            padding:8,
            textAlign:'center',
            cursor:'pointer'
          }}
        >
          <div>
            <div style={{fontSize:13, color:'#666'}}>{`${Math.floor(i/cols)+1} - ${(i%cols)+1}`}</div>
            <div style={{fontWeight:600, marginTop:6}}>{cell.name ?? (cell.empty ? '（空）' : '')}</div>
            {cell.locked && <div style={{fontSize:11, color:'#006400'}}>鎖定</div>}
          </div>
        </div>
      ))}
    </div>
  )
}
