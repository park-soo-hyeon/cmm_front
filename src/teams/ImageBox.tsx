import React from "react";
import styled from "styled-components";
import { Socket } from "socket.io-client";

type ImageBox = {
  node: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fileName: string;
  mimeType: string;
  tId: string;
  pId: string;
  uId: string;
  zIndex?: number;
};

interface ImageBoxesProps {
  imageBoxes: ImageBox[];
  userId: string;
    teamId: string;
    projectId: string;
  setImageBoxes: React.Dispatch<React.SetStateAction<ImageBox[]>>;
  focusedImageIdx: number | null;
  setFocusedImageIdx: React.Dispatch<React.SetStateAction<number | null>>;
  mainAreaRef: React.RefObject<HTMLDivElement | null>;
  socketRef: React.RefObject<Socket | null>;
  getMaxZIndex: () => number;
}

const MIN_WIDTH = 50;
const MIN_HEIGHT = 50;

const ImageBoxes: React.FC<ImageBoxesProps> = ({
  imageBoxes,
  teamId,
  setImageBoxes,
  focusedImageIdx,
  setFocusedImageIdx,
  mainAreaRef,
  socketRef,
  getMaxZIndex,
}) => {
  // 드래그/리사이즈용 ref
  const dragOffset = React.useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const resizeStart = React.useRef<{ startX: number; startY: number; startW: number; startH: number }>({
    startX: 0, startY: 0, startW: 0, startH: 0
  });
  const imageBoxesRef = React.useRef(imageBoxes);
  imageBoxesRef.current = imageBoxes;
  const draggingIdxRef = React.useRef<number | null>(null);
  const resizingIdxRef = React.useRef<number | null>(null);

  // z-index 올리기
  const bringToFront = (idx: number) => {
    setImageBoxes(prev => {
      const maxZ = getMaxZIndex();
      return prev.map((box, i) =>
        i === idx ? { ...box, zIndex: maxZ + 1 } : box
      );
    });
  };

  // 삭제
  const handleDelete = (idx: number) => {
    const node = imageBoxes[idx].node;
    if (!node) return;
    socketRef.current?.emit("imageEvent", {
      fnc: "delete",
      node,
      type: "image"
    });
    setImageBoxes(prev => prev.filter((_, i) => i !== idx));
    if (focusedImageIdx === idx) setFocusedImageIdx(null);
  };

  // 드래그 시작
  const handleDragStart = (idx: number, e: React.MouseEvent) => {
  e.stopPropagation();
  e.preventDefault();
  // idx와 imageBoxesRef.current[idx]가 정상인지 체크
  const box = imageBoxesRef.current[idx];
  if (!box) return;
  setFocusedImageIdx(idx);
  bringToFront(idx);
  draggingIdxRef.current = idx;
  dragOffset.current = {
    x: e.clientX - box.x,
    y: e.clientY - box.y,
  };
  window.addEventListener("mousemove", handleDragging);
  window.addEventListener("mouseup", handleDragOrResizeEnd);
};




  // 드래그 중
  const handleDragging = (e: MouseEvent) => {
  const idx = draggingIdxRef.current;
  if (idx === null || !mainAreaRef.current) return;
  const box = imageBoxesRef.current[idx];
  if (!box) return;
  const rect = mainAreaRef.current.getBoundingClientRect();
  const newX = Math.max(0, Math.min(e.clientX - dragOffset.current.x, rect.width - box.width));
  const newY = Math.max(0, Math.min(e.clientY - dragOffset.current.y, rect.height - box.height));
  if (isNaN(newX) || isNaN(newY)) {
    console.warn("드래그 좌표 NaN!", { newX, newY, box, dragOffset: dragOffset.current });
    return;
  }
  setImageBoxes((prev) => {
    const copy = [...prev];
    copy[idx] = { ...copy[idx], x: newX, y: newY };
    return copy;
  });
  const node = box.node;
  if (node) {
    socketRef.current?.emit("imageEvent", {
      fnc: "move",
      node,
      cLocate: { x: newX, y: newY },
      cScale: { width: box.width, height: box.height },
      type: "image"
    });
  }
};


  React.useEffect(() => {
    imageBoxesRef.current = imageBoxes;
    }, [imageBoxes]);


  // 리사이즈 시작
  const handleResizeStart = (idx: number, e: React.MouseEvent) => {
  e.stopPropagation();
  e.preventDefault();
  setFocusedImageIdx(idx);
  bringToFront(idx);
  resizingIdxRef.current = idx;
  resizeStart.current = {
    startX: e.clientX,
    startY: e.clientY,
    startW: imageBoxesRef.current[idx].width,
    startH: imageBoxesRef.current[idx].height,
  };
  window.addEventListener("mousemove", handleResizing);
  window.addEventListener("mouseup", handleDragOrResizeEnd);
};

  // 리사이즈 중
  const handleResizing = (e: MouseEvent) => {
    const idx = resizingIdxRef.current;
    if (idx === null || !mainAreaRef.current) return;
    const rect = mainAreaRef.current.getBoundingClientRect();
    const { startX, startY, startW, startH } = resizeStart.current;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    const maxWidth = rect.width - imageBoxesRef.current[idx].x;
    const maxHeight = rect.height - imageBoxesRef.current[idx].y;
    const newWidth = Math.max(MIN_WIDTH, Math.min(startW + dx, maxWidth));
    const newHeight = Math.max(MIN_HEIGHT, Math.min(startH + dy, maxHeight));
    setImageBoxes((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], width: newWidth, height: newHeight };
      return copy;
    });
    const node = imageBoxesRef.current[idx].node;
    if (node) {
      socketRef.current?.emit("imageEvent", {
        fnc: "move",
        node,
        cLocate: { x: imageBoxesRef.current[idx].x, y: imageBoxesRef.current[idx].y },
        cScale: { width: newWidth, height: newHeight },
        type: "image"
      });
    }
  };

  // 드래그/리사이즈 종료
  const handleDragOrResizeEnd = () => {
    draggingIdxRef.current = null;
    resizingIdxRef.current = null;
    window.removeEventListener("mousemove", handleDragging);
    window.removeEventListener("mousemove", handleResizing);
    window.removeEventListener("mouseup", handleDragOrResizeEnd);
  };

  return (
    <>
      {imageBoxes.map((img, idx) => (
        <ImageBoxWrap
          key={img.node}
          focused={focusedImageIdx === idx}
          style={{
            left: img.x,
            top: img.y,
            width: img.width,
            height: img.height,
            zIndex: img.zIndex ?? 1
          }}
          tabIndex={0}
          onFocus={() => {
            setFocusedImageIdx(idx);
            bringToFront(idx);
          }}
          onMouseDown={() => bringToFront(idx)}
          onBlur={e => {
            setFocusedImageIdx(cur => (cur === idx ? null : cur));
          }}
        >
          <img
            src={`http://3.220.156.58:3000/api/image/${img.node}/${img.pId}/${img.tId}`}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "fill", pointerEvents: "none" }}
            draggable={false}
          />
          {focusedImageIdx === idx && (
            <>
              <ButtonGroup>
                <CircleBtn
                  color="#00d26a"
                  title="이동"
                  onMouseDown={(e) => handleDragStart(idx, e)}
                />
                <CircleBtn
                  color="#ff4a4a"
                  title="삭제"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDelete(idx);
                  }}
                />
              </ButtonGroup>
              <ResizeHandle onMouseDown={(e) => handleResizeStart(idx, e)} />
            </>
          )}
        </ImageBoxWrap>
      ))}
    </>
  );
};

const ImageBoxWrap = styled.div<{ focused: boolean }>`
  position: absolute;
  min-width: ${MIN_WIDTH}px;
  min-height: ${MIN_HEIGHT}px;
  background: transparent;
  border: 2px solid ${({ focused }) => (focused ? 'rgba(107, 91, 149, 0.5)' : 'transparent')};
  border-radius: 8px;
  box-sizing: border-box;
  padding: 0;
  &:hover {
    border-color: ${({ focused }) => (focused ? '#6b5b95' : 'transparent')};
  }
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

export default ImageBoxes;
