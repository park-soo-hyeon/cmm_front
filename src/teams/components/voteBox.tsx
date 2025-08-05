import React, { useEffect, useRef, useState, useCallback } from "react";
import styled from "styled-components";
import { Socket } from "socket.io-client";
import { ButtonGroup, CircleBtn, ResizeHandle } from './SharedStyles';

type VoteItem = { content: string };
type VoteUser = { uId: string; num: number };
type VoteBox = {
  node: string; x: number; y: number; width: number; height: number;
  title: string; list: VoteItem[]; count: number[]; users: VoteUser[];
  tId: string; pId: string; zIndex?: number;
};

interface VoteBoxesProps {
  voteBoxes: VoteBox[];
  setVoteBoxes: React.Dispatch<React.SetStateAction<VoteBox[]>>;
  focusedVoteIdx: number | null;
  setFocusedVoteIdx: React.Dispatch<React.SetStateAction<number | null>>;
  socketRef: React.RefObject<Socket | null>;
  mainAreaRef: React.RefObject<HTMLDivElement | null>;
  getMaxZIndex: () => number;
  userId: string;
}

const MIN_WIDTH = 200;
const MIN_HEIGHT = 120;

const VoteBoxes: React.FC<VoteBoxesProps> = ({
  voteBoxes, setVoteBoxes, focusedVoteIdx, setFocusedVoteIdx,
  socketRef, mainAreaRef, getMaxZIndex, userId
}) => {
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [resizingIdx, setResizingIdx] = useState<number | null>(null);

  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const resizeStart = useRef<{ startX: number; startY: number; startW: number; startH: number }>({ startX: 0, startY: 0, startW: 0, startH: 0 });
  const voteBoxesRef = useRef(voteBoxes);
  voteBoxesRef.current = voteBoxes;
  const draggingIdxRef = useRef(draggingIdx);
  draggingIdxRef.current = draggingIdx;
  const resizingIdxRef = useRef(resizingIdx);
  resizingIdxRef.current = resizingIdx;
  

  const bringToFront = (idx: number) => {
    setVoteBoxes(prev => {
      const maxZ = getMaxZIndex();
      return prev.map((box, i) => i === idx ? { ...box, zIndex: maxZ + 1 } : box);
    });
  };

  const handleVoteChoice = (voteIdx: number, num: number) => {
    const vote = voteBoxes[voteIdx];
    const alreadyVoted = vote.users.some(u => u.uId === userId && u.num === num);
    socketRef.current?.emit("voteEvent", {
      fnc: "choice", node: vote.node, type: "vote",
      num: alreadyVoted ? 0 : num,
    });
  };

  const handleVoteUpdate = (idx: number, newTitle: string, newList: VoteItem[]) => {
    setVoteBoxes(prev => prev.map((v, i) => i === idx ? { ...v, title: newTitle, list: newList } : v));
    socketRef.current?.emit("voteEvent", {
      fnc: "update", node: voteBoxes[idx].node, type: "vote",
      cTitle: newTitle, cList: newList,
    });
  };

  const handleDeleteVote = (idx: number) => {
    socketRef.current?.emit("voteEvent", { fnc: "delete", node: voteBoxes[idx].node, type: "vote" });
    setVoteBoxes(prev => prev.filter((_, i) => i !== idx));
    if (focusedVoteIdx === idx) setFocusedVoteIdx(null);
  };

  const handleDragStart = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setDraggingIdx(idx);
    dragOffset.current = { x: e.clientX - voteBoxesRef.current[idx].x, y: e.clientY - voteBoxesRef.current[idx].y };
    window.addEventListener("mousemove", handleDragging);
    window.addEventListener("mouseup", handleDragOrResizeEnd);
  };

  const handleDragging = useCallback((e: MouseEvent) => {
    const idx = draggingIdxRef.current;
    if (idx === null || !mainAreaRef.current) return;
    const rect = mainAreaRef.current.getBoundingClientRect();
    const box = voteBoxesRef.current[idx];
    const newX = Math.max(0, Math.min(e.clientX - dragOffset.current.x, rect.width - box.width));
    const newY = Math.max(0, Math.min(e.clientY - dragOffset.current.y, rect.height - box.height));
    setVoteBoxes(prev => prev.map((v, i) => i === idx ? { ...v, x: newX, y: newY } : v));
  }, [mainAreaRef, setVoteBoxes]);

  const handleResizeStart = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setResizingIdx(idx);
    resizeStart.current = { startX: e.clientX, startY: e.clientY, startW: voteBoxesRef.current[idx].width, startH: voteBoxesRef.current[idx].height };
    window.addEventListener("mousemove", handleResizing);
    window.addEventListener("mouseup", handleDragOrResizeEnd);
  };

  const handleResizing = useCallback((e: MouseEvent) => {
    const idx = resizingIdxRef.current;
    if (idx === null || !mainAreaRef.current) return;
    const rect = mainAreaRef.current.getBoundingClientRect();
    const { startX, startY, startW, startH } = resizeStart.current;
    const newWidth = Math.max(MIN_WIDTH, Math.min(startW + e.clientX - startX, rect.width - voteBoxesRef.current[idx].x));
    const newHeight = Math.max(MIN_HEIGHT, Math.min(startH + e.clientY - startY, rect.height - voteBoxesRef.current[idx].y));
    setVoteBoxes(prev => prev.map((v, i) => i === idx ? { ...v, width: newWidth, height: newHeight } : v));
  }, [mainAreaRef, setVoteBoxes]);

  const handleDragOrResizeEnd = useCallback(() => {
    const idx = draggingIdxRef.current ?? resizingIdxRef.current;
    if (idx !== null) {
      const vote = voteBoxesRef.current[idx];
      socketRef.current?.emit("voteEvent", {
        fnc: "move", node: vote.node, type: "vote",
        cLocate: { x: vote.x, y: vote.y },
        cScale: { width: vote.width, height: vote.height },
      });
    }
    setDraggingIdx(null);
    setResizingIdx(null);
    window.removeEventListener("mousemove", handleDragging);
    window.removeEventListener("mousemove", handleResizing);
    window.removeEventListener("mouseup", handleDragOrResizeEnd);
  }, [handleDragging, handleResizing, socketRef]);

  return (
    <>
      {voteBoxes.map((vote, idx) => (
        <VoteBoxWrap
          key={vote.node}
          style={{ left: vote.x, top: vote.y, width: vote.width, height: vote.height, zIndex: vote.zIndex || 1 }}
          tabIndex={0}
          onFocus={() => { setFocusedVoteIdx(idx); bringToFront(idx); }}
          onMouseDown={() => bringToFront(idx)}
          onBlur={() => setFocusedVoteIdx(cur => (cur === idx ? null : cur))}
        >
          <VoteVoterCount>총 {vote.users.length}명 참여</VoteVoterCount>
          <VoteTitleInput value={vote.title} onChange={e => handleVoteUpdate(idx, e.target.value, vote.list)} placeholder="투표 제목" />
          <VoteList>
            {vote.list.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <VoteItemInput
                  value={item.content}
                  onChange={e => {
                    const newList = vote.list.map((it, itemIdx) => itemIdx === i ? { ...it, content: e.target.value } : it);
                    handleVoteUpdate(idx, vote.title, newList);
                  }}
                  onClick={e => e.stopPropagation()}
                />
                <VoteItemBtn selected={vote.users.some(u => u.uId === userId && u.num === i + 1)} onClick={() => handleVoteChoice(idx, i + 1)}>
                  {vote.count[i]}
                </VoteItemBtn>
              </div>
            ))}
          </VoteList>
          {focusedVoteIdx === idx && (
            <>
              <ButtonGroup>
                <CircleBtn color="#00d26a" title="이동" onMouseDown={e => handleDragStart(idx, e)} />
                <CircleBtn color="#ff4a4a" title="삭제" onMouseDown={e => { e.stopPropagation(); handleDeleteVote(idx); }} />
              </ButtonGroup>
              <ResizeHandle onMouseDown={e => handleResizeStart(idx, e)} />
            </>
          )}
        </VoteBoxWrap>
      ))}
    </>
  );
};

const VoteBoxWrap = styled.div` position: absolute; background: #fff; border: 2px solid #6b5b95; border-radius: 8px; padding: 12px; box-sizing: border-box; min-width: 200px; min-height: 120px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); `;
const VoteTitleInput = styled.input` width: 100%; font-size: 18px; font-weight: bold; border: none; background: transparent; margin-bottom: 10px; outline: none; `;
const VoteList = styled.div` display: flex; flex-direction: column; gap: 8px; max-height: calc(100% - 48px); overflow-y: auto; `;
const VoteItemInput = styled.input` width: 100%; font-size: 15px; border: 1px solid #ddd; border-radius: 4px; padding: 4px 6px; background: #fafaff; box-sizing: border-box; &:focus { border-color: #6b5b95; background: #fff; outline: none; } `;
const VoteItemBtn = styled.button<{ selected: boolean }>` min-width: 60px; padding: 6px 8px; border-radius: 6px; border: 1.5px solid ${({ selected }) => (selected ? "#6b5b95" : "#ddd")}; background: ${({ selected }) => (selected ? "#e3e0f8" : "#fff")}; font-size: 15px; cursor: pointer; transition: background 0.15s; &:hover { background: #f6f0ff; } `;
const VoteVoterCount = styled.div` position: absolute; right: 7px; top: 10px; font-size: 12px; color: #888; background: rgba(255,255,255,0.8); padding: 2px 8px; border-radius: 8px; `;

export default VoteBoxes;

