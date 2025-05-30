  import React, { useEffect, useRef, useState, useCallback } from "react";
  import styled from "styled-components";
  import { Socket } from "socket.io-client";

  type VoteItem = { content: string };
  type VoteUser = { uId: string; num: number };

  type VoteBox = {
    node: string;
    x: number;
    y: number;
    width: number;
    height: number;
    title: string;
    list: VoteItem[];
    count: number[];
    users: VoteUser[];
    tId: string;
    pId: string;
    zIndex?: number; // 추가!
  };


  interface VoteBoxesProps {
    focusedVoteIdx: number | null;
  setFocusedVoteIdx: React.Dispatch<React.SetStateAction<number | null>>;
    voteBoxes: VoteBox[];
    setVoteBoxes: React.Dispatch<React.SetStateAction<VoteBox[]>>;
    socketRef: React.RefObject<Socket | null>;
    mainAreaRef: React.RefObject<HTMLDivElement | null>;
    getMaxZIndex: () => number;
    userId: string;
    teamId: string;
    projectId: string;
  }

  const MIN_WIDTH = 200;
  const MIN_HEIGHT = 120;

  const VoteBoxes: React.FC<VoteBoxesProps> = ({
    voteBoxes,
  getMaxZIndex,
  setVoteBoxes,
  socketRef,
  mainAreaRef,
  userId,
  teamId,
  projectId,
  focusedVoteIdx,
  setFocusedVoteIdx,
  }) => {
    const bringToFrontVote = (idx: number) => {
    setVoteBoxes(prev => {
      const maxZ = getMaxZIndex();
      return prev.map((box, i) =>
        i === idx ? { ...box, zIndex: maxZ + 1 } : box
      );
    });
  };


    const [isVoteMode, setIsVoteMode] = useState(false);
    const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
    const [resizingIdx, setResizingIdx] = useState<number | null>(null);

    // 드래그/리사이즈 관련 ref
    const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const resizeStart = useRef<{ startX: number; startY: number; startW: number; startH: number }>({
      startX: 0, startY: 0, startW: 0, startH: 0
    });
    const voteBoxesRef = useRef(voteBoxes);
    voteBoxesRef.current = voteBoxes;
    const draggingIdxRef = useRef(draggingIdx);
    draggingIdxRef.current = draggingIdx;
    const resizingIdxRef = useRef(resizingIdx);
    resizingIdxRef.current = resizingIdx;

    // 소켓 이벤트 등록
    useEffect(() => {
      const socket = socketRef.current;
      if (!socket) return;

      socket.on("addVote", (data) => {
        setVoteBoxes((prev) => [
          ...prev,
          {
            node: data.node,
            x: data.cLocate.x,
            y: data.cLocate.y,
            width: data.cScale.width,
            height: data.cScale.height,
            title: data.cTitle,
            list: data.cList,
            count: [0, 0, 0, 0],
            users: [],
            tId: data.tId,
            pId: data.pId,
          },
        ]);
      });

      socket.on("updateVote", (data) => {
        setVoteBoxes((prev) =>
          prev.map((vote) =>
            vote.node === data.node
              ? { ...vote, title: data.cTitle, list: data.cList }
              : vote
          )
        );
      });

      socket.on("moveVote", (data) => {
        if (draggingIdxRef.current !== null || resizingIdxRef.current !== null) return;
        setVoteBoxes(
          voteBoxesRef.current.map((vote) =>
            vote.node === data.node
              ? {
                  ...vote,
                  x: data.cLocate.x,
                  y: data.cLocate.y,
                  width: data.cScale.width,
                  height: data.cScale.height,
                }
              : vote
          )
        );
      });

      socket.on("deleteVote", (data) => {
        setVoteBoxes((prev) => prev.filter((vote) => vote.node !== data.node));
      });

      socket.on("choiceVote", (data) => {
        setVoteBoxes((prev) =>
          prev.map((vote) =>
            vote.node === data.node
              ? {
                  ...vote,
                  count: data.count,
                  users: [
                    ...vote.users.filter((u) => u.uId !== data.user),
                    ...(data.num >= 1 && data.num <= 4
                      ? [{ uId: data.user, num: data.num }]
                      : []),
                  ],
                }
              : vote
          )
        );
      });

      return () => {
        socket.off("addVote");
        socket.off("updateVote");
        socket.off("moveVote");
        socket.off("deleteVote");
        socket.off("choiceVote");
      };
    }, [socketRef]);

    // 투표 박스 생성 핸들러
    const handleMainAreaClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isVoteMode || !mainAreaRef.current || !socketRef.current) return;
      const rect = mainAreaRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width - 300));
      const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height - 200));
      socketRef.current.emit("voteEvent", {
        fnc: "new",
        cLocate: { x, y },
        cScale: { width: 300, height: 200 },
        cTitle: "",
        cList: [
          { content: "항목1" },
          { content: "항목2" },
          { content: "항목3" },
          { content: "항목4" },
        ],
        type: "vote",
      });
      setIsVoteMode(false);
    };

    // 투표 항목 선택/취소
    const handleVoteChoice = (voteIdx: number, num: number) => {
    if (!socketRef.current) return;
    const vote = voteBoxes[voteIdx];
    const node = vote.node;
    if (!node) return;

    // 현재 사용자가 이미 이 항목(num)을 선택했는지 확인
    const alreadyVoted = vote.users.some(
      (u) => u.uId === userId && u.num === num
    );

    socketRef.current.emit("voteEvent", {
      fnc: "choice",
      node,
      num: alreadyVoted ? 0 : num, // 이미 선택한 항목이면 0(취소), 아니면 선택
      type: "vote",
    });
  };


    // 제목/항목 수정
    const handleVoteUpdate = (idx: number, newTitle: string, newList: VoteItem[]) => {
      if (!socketRef.current) return;
      const node = voteBoxes[idx].node;
      setVoteBoxes((prev) =>
        prev.map((v, i) =>
          i === idx ? { ...v, title: newTitle, list: newList } : v
        )
      );
      socketRef.current.emit("voteEvent", {
        fnc: "update",
        node,
        cTitle: newTitle,
        cList: newList,
        type: "vote",
      });
    };

    // 삭제
    const handleDeleteVote = (idx: number) => {
      if (!socketRef.current) return;
      const node = voteBoxes[idx].node;
      if (!node) return;
      socketRef.current.emit("voteEvent", {
        fnc: "delete",
        node,
        type: "vote",
      });
      setVoteBoxes((prev) => prev.filter((_, i) => i !== idx));
    };

    // 드래그
    const handleDragStartVote = (idx: number, e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      setDraggingIdx(idx);
      dragOffset.current = {
        x: e.clientX - voteBoxesRef.current[idx].x,
        y: e.clientY - voteBoxesRef.current[idx].y,
      };
      window.addEventListener("mousemove", handleDraggingVote);
      window.addEventListener("mouseup", handleDragOrResizeEndVote);
    };

    const handleDraggingVote = useCallback((e: MouseEvent) => {
    const idx = draggingIdxRef.current;
    if (idx === null || !mainAreaRef.current || !socketRef.current) return;
    const rect = mainAreaRef.current.getBoundingClientRect();
    const box = voteBoxesRef.current[idx];
    // 여기!
    const newX = Math.max(0, Math.min(e.clientX - dragOffset.current.x, rect.width - box.width));
    const newY = Math.max(0, Math.min(e.clientY - dragOffset.current.y, rect.height - box.height));

    setVoteBoxes((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], x: newX, y: newY };
      return copy;
    });
    const node = voteBoxesRef.current[idx].node;
    if (node) {
      socketRef.current.emit("voteEvent", {
        fnc: "move",
        node,
        cLocate: { x: newX, y: newY },
        cScale: { width: voteBoxesRef.current[idx].width, height: voteBoxesRef.current[idx].height },
        type: "vote",
      });
    }
  }, [mainAreaRef, socketRef]);



    // 리사이즈
    const handleResizeStartVote = (idx: number, e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      setResizingIdx(idx);
      resizeStart.current = {
        startX: e.clientX,
        startY: e.clientY,
        startW: voteBoxesRef.current[idx].width,
        startH: voteBoxesRef.current[idx].height,
      };
      window.addEventListener("mousemove", handleResizingVote);
      window.addEventListener("mouseup", handleDragOrResizeEndVote);
    };

    const handleResizingVote = useCallback((e: MouseEvent) => {
      const idx = resizingIdxRef.current;
      if (idx === null || !mainAreaRef.current || !socketRef.current) return;
      const rect = mainAreaRef.current.getBoundingClientRect();
      const { startX, startY, startW, startH } = resizeStart.current;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const maxWidth = rect.width - voteBoxesRef.current[idx].x;
      const maxHeight = rect.height - voteBoxesRef.current[idx].y;
      const newWidth = Math.max(MIN_WIDTH, Math.min(startW + dx, maxWidth));
      const newHeight = Math.max(MIN_HEIGHT, Math.min(startH + dy, maxHeight));
      setVoteBoxes((prev) => {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], width: newWidth, height: newHeight };
        return copy;
      });
      const node = voteBoxesRef.current[idx].node;
      if (node) {
        socketRef.current.emit("voteEvent", {
          fnc: "move",
          node,
          cLocate: { x: voteBoxesRef.current[idx].x, y: voteBoxesRef.current[idx].y },
          cScale: { width: newWidth, height: newHeight },
          type: "vote",
        });
      }
    }, [mainAreaRef, socketRef]);

    // 드래그/리사이즈 종료
    const handleDragOrResizeEndVote = useCallback(() => {
      setDraggingIdx(null);
      setResizingIdx(null);
      window.removeEventListener("mousemove", handleDraggingVote);
      window.removeEventListener("mousemove", handleResizingVote);
      window.removeEventListener("mouseup", handleDragOrResizeEndVote);
    }, [handleDraggingVote, handleResizingVote]);

    // 메인 영역 클릭 이벤트
    useEffect(() => {
      if (!mainAreaRef.current) return;
      const area = mainAreaRef.current;
      const handler = (e: MouseEvent) => handleMainAreaClick(e as any);
      if (isVoteMode) area.addEventListener("click", handler);
      return () => {
        area.removeEventListener("click", handler);
      };
      // eslint-disable-next-line
    }, [isVoteMode, mainAreaRef, socketRef]);

    // UI 렌더링
    return (
      <>
        {voteBoxes.map((vote, idx) => (
          <VoteBoxWrap
    key={vote.node}
    style={{
      left: vote.x,
      top: vote.y,
      width: vote.width,
      height: vote.height,
      zIndex: vote.zIndex || 1,
    }}
    tabIndex={0}
    onFocus={() => {
      setFocusedVoteIdx(idx);
      bringToFrontVote(idx);
    }}
    onMouseDown={() => bringToFrontVote(idx)}
    onBlur={e => {
      setFocusedVoteIdx(cur => (cur === idx ? null : cur));
    }}
  >
          <VoteVoterCount>
      총 {vote.users.length}명 참여
    </VoteVoterCount>
            <VoteTitleInput
              value={vote.title}
              onChange={(e) => {
                handleVoteUpdate(idx, e.target.value, vote.list);
              }}
              placeholder="투표 제목"
            />
            <VoteList>
    {vote.list.map((item, i) => (
      <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <VoteItemInput
          value={item.content}
          onChange={e => {
            const newList = vote.list.map((it, idx) =>
              idx === i ? { ...it, content: e.target.value } : it
            );
            handleVoteUpdate(idx, vote.title, newList);
          }}
          onClick={e => e.stopPropagation()}
        />
        <VoteItemBtn
          selected={vote.users.some(
            (u) => u.uId === userId && u.num === i + 1
          )}
          onClick={() => handleVoteChoice(idx, i + 1)}
        >
          {vote.count[i]}
        </VoteItemBtn>
      </div>
    ))}
  </VoteList>

            {focusedVoteIdx === idx && (
              <ButtonGroup>
                <CircleBtn
                  color="#00d26a"
                  title="이동"
                  onMouseDown={(e) => handleDragStartVote(idx, e)}
                />
                <CircleBtn
                  color="#ff4a4a"
                  title="삭제"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDeleteVote(idx);
                  }}
                />
              </ButtonGroup>
            )}
            <ResizeHandle onMouseDown={(e) => handleResizeStartVote(idx, e)} />
          </VoteBoxWrap>
        ))}
      </>
    );
  };

  // 스타일 컴포넌트
  const VoteToolbar = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    position: absolute;
    left: 50px;
    top: 24px;
    z-index: 10;
  `;

  const VoteToolIcon = styled.button`
    background: transparent;
    border: none;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    cursor: pointer;
    color: #444;
    padding: 0;
    &:hover {
      color: #000;
    }
  `;

  const VoteBoxWrap = styled.div`
    position: absolute;
    background: #fff;
    border: 2px solid #6b5b95;
    border-radius: 8px;
    padding: 12px;
    box-sizing: border-box;
    min-width: 200px;
    min-height: 120px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  `;


  const VoteTitleInput = styled.input`
    width: 100%;
    font-size: 18px;
    font-weight: bold;
    border: none;
    background: transparent;
    margin-bottom: 10px;
    outline: none;
  `;

  const VoteList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    /* 부모(VoteBoxWrap)의 패딩과 타이틀 높이를 고려해 계산 */
    max-height: calc(100% - 48px); /* 48px = 타이틀+패딩 등 여유 */
    overflow-y: auto;
  `;

  const VoteItemBtn = styled.button<{ selected: boolean }>`
    width: 80px; /* 또는 60px, 50%, 등 원하는 값 */
    min-width: 60px; /* 너무 작아지지 않게 최소값 지정 가능 */
    padding: 6px 8px; /* 세로/가로 패딩도 함께 조정 */
    border-radius: 6px;
    border: 1.5px solid ${({ selected }) => (selected ? "#6b5b95" : "#ddd")};
    background: ${({ selected }) => (selected ? "#e3e0f8" : "#fff")};
    font-size: 15px;
    cursor: pointer;
    text-align: center;
    transition: background 0.15s;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    &:hover {
      background: #f6f0ff;
    }
  `;

  const VoteVoterCount = styled.div`
    position: absolute;
    right: 7px;
    top: 10px;
    font-size: 12px;
    color: #888;
    background: rgba(255,255,255,0.8);
    padding: 2px 8px;
    border-radius: 8px;
    pointer-events: none;
    user-select: none;
  `;




  const ButtonGroup = styled.div`
    position: absolute;
    top: -18px;
    right: 0;
    display: flex;
    gap: 2px;
  `;

  const CircleBtn = styled.button<{ color: string }>`
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: ${({ color }) => color};
    border: 1.5px solid #fff;
    box-shadow: 0 1px 2px rgba(0,0,0,0.08);
    cursor: pointer;
    transition: transform 0.1s;
    &:active {
      transform: scale(0.92);
    }
  `;

  const ResizeHandle = styled.div`
    position: absolute;
    right: 0;
    bottom: 0;
    width: 12px;
    height: 12px;
    background: #6b5b95;
    border-radius: 2px;
    cursor: nwse-resize;
    &:hover {
      background: #8a76c5;
    }
  `;

  const VoteItemInput = styled.input`
    width: 100%;
    font-size: 15px;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 4px 6px;
    background: #fafaff;
    box-sizing: border-box;
    &:focus {
      border-color: #6b5b95;
      background: #fff;
      outline: none;
    }
  `;



  export default VoteBoxes;
