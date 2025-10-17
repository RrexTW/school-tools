import React, { useState, useEffect } from "react";
import SeatGrid from "../components/SeatGrid";
import { parseCSV } from "../components/fileHelpers";

const SeatsPage = () => {
  // 狀態用於儲存行數、列數、學生名單及座位配置
  const [rows, setRows] = useState(4);
  const [cols, setCols] = useState(6);
  const [names, setNames] = useState([]); // 學生物件 {name, status}
  const [grid, setGrid] = useState([]); // 座位資料

  // 初始化座位配置，根據行列數計算總座位
  useEffect(() => {
    const size = rows * cols;
    setGrid(
      Array.from({ length: size }, () => ({
        name: null,
        locked: false,
        empty: false,
      }))
    );
  }, [rows, cols]);

  // 處理文字框輸入，將每行的文字作為學生姓名更新學生名單
  function handleNameInput(e) {
    const list = e.target.value
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    const newList = list.map((n) => {
      const existing = names.find((x) => x.name === n);
      return existing || { name: n, status: "unassigned" };
    });
    setNames(newList);
  }

  // 處理匯入 CSV 檔案，解析後合併更新學生名單
  async function handleFile(e) {
    const f = e.target.files[0];
    if (!f) return;
    const list = await parseCSV(f);
    const merged = list.map((n) => {
      const existing = names.find((x) => x.name === n);
      return existing || { name: n, status: "unassigned" };
    });
    setNames(merged);
  }

  // 隨機分配未分配的學生到可用座位
  // 1. 過濾出未鎖定且未空的座位作為可用座位清單
  // 2. 將「未分配」學生隨機排列後，逐一填入可用座位
  // 3. 更新學生狀態為 "assigned"
  function randomize() {
    const availableSeats = grid
      .map((c, i) => (!c.locked && !c.empty ? i : null))
      .filter((i) => i !== null);

    // 修改 pool 過濾，只包含 assigned 與 unassigned 的學生
    const pool = names
      .filter((n) => n.status === "assigned" || n.status === "unassigned")
      .map((n) => n.name);
      
    const shuffled = [...pool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const newGrid = [...grid];
    for (let i = 0; i < availableSeats.length; i++) {
      const idx = availableSeats[i];
      newGrid[idx].name = shuffled[i] || null;
    }
    setGrid(newGrid);

    // 更新學生狀態：若座位上有學生則設為 "assigned"（除非原已為 "lock"），否則保持未分配
    const updatedNames = names.map((n) => {
      if (n.status === "lock") return n;
      return {
        ...n,
        status: newGrid.some((c) => c.name === n.name) ? "assigned" : "unassigned"
      }
    });
    setNames(updatedNames);
  }

  // 處理拖曳動作將學生或座位資料拖入目標座位
  // 當拖放資料類型為 "name" 時，將該學生分配到座位，並如有衝突調整狀態
  // 當拖放資料類型為 "seat" 時，執行座位資料的交換及後續狀態更新
  function handleDropNameToSeat(dragData, seatIndex) {
    const newGrid = [...grid];
    const seat = newGrid[seatIndex];
    // 允許落在空席或鎖定席位，但仍需檢查空席
    if (seat.empty) return;

    if (dragData.type === "name") {
      const name = dragData.value;
      const student = names.find((n) => n.name === name);
      if (!student || student.status === "skip") return;

      const existing = seat.name;
      newGrid[seatIndex].name = name;
      // 根據目標席位是否被鎖定決定學生狀態：鎖定則為 "lock"，否則為 "assigned"
      const newStatus = seat.locked ? "lock" : "assigned";
  
      const updatedNames = names.map((n) => {
        if(n.name === name) return { ...n, status: newStatus };
        if(n.name === existing) return { ...n, status: "unassigned" };
        return n;
      });
      setGrid(newGrid);
      setNames(updatedNames);
    } else if (dragData.type === "seat") {
      const fromIndex = dragData.index;
      if (fromIndex === seatIndex) return;
      const newGrid = [...grid];
      // 交換座位上的學生
      const temp = newGrid[seatIndex].name;
      newGrid[seatIndex].name = newGrid[fromIndex].name;
      newGrid[fromIndex].name = temp;
      setGrid(newGrid);
  
      // 更新交換後每個席位上學生的狀態，依各自 cell 的鎖定狀態決定
      const updatedNames = names.map((n) => {
        if (newGrid.some((c, idx) => c.name === n.name && c.locked && (idx === seatIndex || idx === fromIndex)))
          return { ...n, status: "lock" };
        if (newGrid.some((c, idx) => c.name === n.name && !c.locked && (idx === seatIndex || idx === fromIndex)))
          return { ...n, status: "assigned" };
        return n;
      });
      setNames(updatedNames);
    }
  }
  
  // 清空所有座位，取消未鎖定座位中學生的分配狀態，略過被鎖定位置的學生
  function clearSeats() {
    // 僅清空非鎖定座位
    const cleared = grid.map(c => c.locked ? c : { ...c, name: null });
    setGrid(cleared);
    // 更新學生狀態：若學生仍在鎖定座位中，狀態保持 "lock"，否則若原為 "assigned" 則轉為 "unassigned"
    const updatedNames = names.map(n => 
      cleared.some(c => c.locked && c.name === n.name) 
        ? n 
        : (n.status === "assigned" ? { ...n, status: "unassigned" } : n)
    );
    setNames(updatedNames);
  }

  // 切換學生狀態：於「未分配」與「跳過」間切換，若為其他狀態則預設切換為「跳過」並從 grid 移除
  function toggleStatus(name) {
    // 取得該學生原始狀態
    const originalStudent = names.find((n) => n.name === name);
    if (!originalStudent) return;

    let newStatus;
    if (originalStudent.status === "unassigned") {
      newStatus = "skip";
    } else if (originalStudent.status === "skip") {
      newStatus = "unassigned";
    } else {
      newStatus = "skip";
    }

    // 更新學生狀態
    const updatedNames = names.map((n) =>
      n.name === name ? { ...n, status: newStatus } : n
    );
    setNames(updatedNames);

    // 如果原狀態非「未分配」或「跳過」，則從 grid 移除該學生
    if (originalStudent.status !== "unassigned" && originalStudent.status !== "skip") {
      setGrid(grid.map((c) => (c.name === name ? { ...c, name: null } : c)));
    }
  }

  // 新增：更新被鎖定或取消鎖定席位中學生狀態的回呼函式
  function handleLockToggle(name, locked) {
    const updatedNames = names.map(n => 
      n.name === name ? { ...n, status: locked ? "lock" : "assigned" } : n
    );
    setNames(updatedNames);
  }

  return (
    <div
      style={{
        padding: 20,
        fontFamily: "sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h1>隨機排座位</h1>

      {/* 控制區 */}
      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 12 }}
      >
        <label>
          行數：
          <input
            type="number"
            value={rows}
            min={1}
            onChange={(e) => setRows(Number(e.target.value))}
          />
        </label>
        <label>
          列數：
          <input
            type="number"
            value={cols}
            min={1}
            onChange={(e) => setCols(Number(e.target.value))}
          />
        </label>
        <input type="file" accept=".csv" onChange={handleFile} />
        <button onClick={randomize}>隨機分配</button>
        <button onClick={clearSeats}>清空所有座位</button>
      </div>
      {/* 座位區 */}
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
        <SeatGrid
          grid={grid}
          setGrid={setGrid}
          rows={rows}
          cols={cols}
          onDropData={handleDropNameToSeat}
          onLockToggle={handleLockToggle}
        />

        {/* 名單區 */}
        <div
          style={{
            width: 260,
            maxHeight: 400,
            overflowY: "auto",
            border: "1px solid #ccc",
            borderRadius: 8,
            padding: 8,
          }}
        >
          <h3 style={{ marginTop: 0 }}>學生名單</h3>
          <textarea
            rows={6}
            style={{
              width: "100%",
              boxSizing: "border-box",
              fontFamily: "inherit",
            }}
            placeholder="輸入學生名單，每行一個名字"
            onChange={handleNameInput}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              marginTop: 8,
            }}
          >
            {names.map((s, i) => (
              <div
                key={i}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("data-type", "name");
                  e.dataTransfer.setData("data-value", s.name);
                }}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "#eef",
                  border: "1px solid #99f",
                  borderRadius: 6,
                  padding: "4px 8px",
                  cursor: "grab",
                  fontSize: 14,
                }}
              >
                <span>{s.name}</span>
                <span
                  style={{
                    cursor: "pointer",
                    color:
                      s.status === "assigned"
                        ? "green"
                        : s.status === "skip"
                        ? "gray"
                        : "red",
                  }}
                  title="點擊切換狀態"
                  onClick={() => toggleStatus(s.name)}
                >
                  {s.status === "assigned"
                    ? "✓"
                    : s.status === "skip"
                    ? "○"
                    : s.status === "lock"
                    ? "L"
                    : "✕"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatsPage;
