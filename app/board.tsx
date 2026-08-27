'use client';

import { useEffect, useMemo, useState } from "react";

type Row = { id: number; title: string; done: boolean; note: string };

const initialRows: Row[] = [
  { id: 1, title: "콘크리트 균열", done: true, note: "암기 완료" },
  { id: 2, title: "철골 접합", done: false, note: "다시 공부" },
  { id: 3, title: "방수공법", done: false, note: "" },
  { id: 4, title: "건축시공 기출", done: false, note: "" }
];

export default function Board() {
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [title, setTitle] = useState("나의 공유 보드");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("gridaboard-data");
    if (raw) {
      try {
        const data = JSON.parse(raw);
        if (Array.isArray(data.rows)) setRows(data.rows);
        if (typeof data.title === "string") setTitle(data.title);
      } catch {}
    }
  }, []);

  const completed = useMemo(() => rows.filter(r => r.done).length, [rows]);

  function updateRow(id: number, patch: Partial<Row>) {
    setRows(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));
    setSaved(false);
  }

  function addRow() {
    const id = rows.length ? Math.max(...rows.map(r => r.id)) + 1 : 1;
    setRows(prev => [...prev, { id, title: "새 항목", done: false, note: "" }]);
    setSaved(false);
  }

  function deleteRow(id: number) {
    setRows(prev => prev.filter(r => r.id !== id));
    setSaved(false);
  }

  function save() {
    localStorage.setItem("gridaboard-data", JSON.stringify({ title, rows }));
    setSaved(true);
  }

  async function share() {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      alert("현재 보드 링크를 복사했습니다.");
    } catch {
      prompt("아래 링크를 복사하세요.", url);
    }
  }

  return (
    <main className="page">
      <section className="board">
        <header className="header">
          <div>
            <input className="title" value={title} onChange={e => { setTitle(e.target.value); setSaved(false); }} />
            <div className="sub">완료 {completed} / {rows.length}</div>
          </div>
          <div className="actions">
            <button onClick={addRow}>+ 항목</button>
            <button onClick={save}>저장</button>
            <button className="primary" onClick={share}>공유 링크 복사</button>
          </div>
        </header>

        <div className="notice">
          현재 버전은 <b>이 브라우저에 저장</b>됩니다. 여러 사람이 같은 내용을 함께 수정하려면 DB 연결이 필요합니다.
        </div>

        <div className="table">
          <div className="tr th">
            <div>완료</div><div>항목</div><div>메모</div><div></div>
          </div>
          {rows.map(row => (
            <div className="tr" key={row.id}>
              <div>
                <input type="checkbox" checked={row.done} onChange={e => updateRow(row.id, { done: e.target.checked })} />
              </div>
              <div>
                <input className={row.done ? "item done" : "item"} value={row.title}
                  onChange={e => updateRow(row.id, { title: e.target.value })} />
              </div>
              <div>
                <input className="item" value={row.note}
                  onChange={e => updateRow(row.id, { note: e.target.value })} placeholder="메모" />
              </div>
              <div><button className="delete" onClick={() => deleteRow(row.id)}>삭제</button></div>
            </div>
          ))}
        </div>

        <footer>
          <span>{saved ? "저장됨" : "변경사항 있음"}</span>
          <span>Gridaboard starter</span>
        </footer>
      </section>
    </main>
  );
}
