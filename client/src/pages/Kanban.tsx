import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import { getKanbanSocket } from "../api/socket";
import { Card, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Column } from "../components/Kanban/Column";
import { CardItem } from "../components/Kanban/CardItem";
import { KanbanBoard, KanbanCard } from "../types";

export default function Kanban() {
  const [boards, setBoards] = useState<KanbanBoard[]>([]);
  const [boardId, setBoardId] = useState<string>("");
  const [cards, setCards] = useState<KanbanCard[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newColumn, setNewColumn] = useState("");
  const [newBoardName, setNewBoardName] = useState("");

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const board = useMemo(() => boards.find((b) => b._id === boardId) ?? null, [boards, boardId]);

  useEffect(() => {
    api.get("/kanban/boards").then((r) => {
      setBoards(r.data.boards);
      if (r.data.boards.length > 0) setBoardId(r.data.boards[0]._id);
    });
  }, []);

  useEffect(() => {
    if (!boardId) return;
    api.get(`/kanban/boards/${boardId}/cards`).then((r) => setCards(r.data.cards));
    if (board) setNewColumn(board.columns[0]?.id ?? "");

    const socket = getKanbanSocket();
    socket.emit("board:join", boardId);

    function onCreated(card: KanbanCard) {
      if (card.boardId === boardId) setCards((prev) => [...prev, card]);
    }
    function onUpdated(card: KanbanCard) {
      if (card.boardId === boardId) setCards((prev) => prev.map((c) => (c._id === card._id ? card : c)));
    }
    function onDeleted(payload: { id: string; boardId: string }) {
      if (payload.boardId === boardId) setCards((prev) => prev.filter((c) => c._id !== payload.id));
    }

    socket.on("card:created", onCreated);
    socket.on("card:updated", onUpdated);
    socket.on("card:deleted", onDeleted);

    return () => {
      socket.emit("board:leave", boardId);
      socket.off("card:created", onCreated);
      socket.off("card:updated", onUpdated);
      socket.off("card:deleted", onDeleted);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId]);

  async function createBoard(e: FormEvent) {
    e.preventDefault();
    const r = await api.post("/kanban/boards", { name: newBoardName });
    setBoards((prev) => [r.data.board, ...prev]);
    setBoardId(r.data.board._id);
    setNewBoardName("");
  }

  async function addCard(e: FormEvent) {
    e.preventDefault();
    if (!board || !newColumn) return;
    const columnCards = cards.filter((c) => c.columnId === newColumn);
    await api.post("/kanban/cards", { boardId: board._id, columnId: newColumn, title: newTitle, order: columnCards.length });
    setNewTitle("");
  }

  async function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const cardId = String(active.id);
    const targetColumn = String(over.id);
    const dragged = cards.find((c) => c._id === cardId);
    if (!dragged || dragged.columnId === targetColumn) return;

    const targetCount = cards.filter((c) => c.columnId === targetColumn).length;
    setCards((prev) => prev.map((c) => (c._id === cardId ? { ...c, columnId: targetColumn, order: targetCount } : c)));
    await api.patch(`/kanban/cards/${cardId}`, { columnId: targetColumn, order: targetCount });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Kanban</h1>
          <p className="text-slate-500 text-sm mt-1">Live task delegation across staff — updates sync in real time.</p>
        </div>
        <select value={boardId} onChange={(e) => setBoardId(e.target.value)} className="input max-w-xs">
          {boards.map((b) => (
            <option key={b._id} value={b._id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      <Card>
        <CardHeader title="Boards" />
        <form onSubmit={createBoard} className="p-4 flex gap-3">
          <input
            placeholder="New board name"
            value={newBoardName}
            onChange={(e) => setNewBoardName(e.target.value)}
            className="input flex-1"
          />
          <Button type="submit" disabled={!newBoardName}>
            Create board
          </Button>
        </form>
      </Card>

      {board && (
        <>
          <Card className="p-4">
            <form onSubmit={addCard} className="flex flex-wrap gap-3 items-end">
              <label className="block flex-1 min-w-[200px]">
                <span className="block text-sm font-medium text-slate-700 mb-1">New card</span>
                <input required value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="input" />
              </label>
              <label className="block">
                <span className="block text-sm font-medium text-slate-700 mb-1">Column</span>
                <select value={newColumn} onChange={(e) => setNewColumn(e.target.value)} className="input">
                  {board.columns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <Button type="submit">Add card</Button>
            </form>
          </Card>

          <DndContext sensors={sensors} onDragEnd={onDragEnd}>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {board.columns
                .sort((a, b) => a.order - b.order)
                .map((col) => {
                  const colCards = cards.filter((c) => c.columnId === col.id).sort((a, b) => a.order - b.order);
                  return (
                    <Column key={col.id} id={col.id} title={col.name} count={colCards.length}>
                      {colCards.map((c) => (
                        <CardItem key={c._id} card={c} />
                      ))}
                    </Column>
                  );
                })}
            </div>
          </DndContext>
        </>
      )}
    </div>
  );
}
