import React, { useCallback } from "react";
import styled from "styled-components";
import { Socket } from "socket.io-client";
import { ButtonGroup, CircleBtn, ResizeHandle } from './SharedStyles';

const MIN_WIDTH = 50;
const MIN_HEIGHT = 30;

const TextBoxInputBase = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { width: number; height: number }
>(({ width, height, style, ...rest }, ref) => (
  <textarea
    ref={ref}
    style={{
      width: width - 16,
      height: height - 16,
      padding: 8,
      border: "none",
      background: "transparent",
      resize: "none",
      outline: "none",
      minWidth: MIN_WIDTH - 16,
      minHeight: MIN_HEIGHT - 16,
      boxSizing: "border-box",
      ...style,
    }}
    {...rest}
  />
));
TextBoxInputBase.displayName = "TextBoxInputBase";

const TextBoxInput = styled(TextBoxInputBase)<{ $focused?: boolean }>`
  &::-webkit-scrollbar { display: none; }
  scrollbar-width: none;
  -ms-overflow-style: none;

  ${({ $focused }) =>
    $focused &&
    `
      &::-webkit-scrollbar { display: initial; }
      scrollbar-width: auto;
      -ms-overflow-style: auto;
    `}
`;

type TextBox = { 
  x: number; y: number; text: string; width: number; height: number;
  color: string; size: number; font: string; node?: string; zIndex?: number;
};

interface TextBoxesProps {
  textBoxes: TextBox[];
  setTextBoxes: React.Dispatch<React.SetStateAction<TextBox[]>>;
  focusedIdx: number | null;
  setFocusedIdx: React.Dispatch<React.SetStateAction<number | null>>;
  mainAreaRef: React.RefObject<HTMLDivElement | null>;
  socketRef: React.RefObject<Socket | null>;
  toolbarRef: React.RefObject<HTMLDivElement | null>;
  getMaxZIndex: () => number;
}

const TextBoxes: React.FC<TextBoxesProps> = ({
  getMaxZIndex, textBoxes, setTextBoxes, focusedIdx, setFocusedIdx,
  mainAreaRef, socketRef, toolbarRef,
}) => {
  const [draggingIdx, setDraggingIdx] = React.useState<number | null>(null);
  const [resizingIdx, setResizingIdx] = React.useState<number | null>(null);
  
  const inputRefs = React.useRef<(HTMLTextAreaElement | null)[]>([]);
  const dragOffset = React.useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const resizeStart = React.useRef<{ startX: number; startY: number; startW: number; startH: number }>({
    startX: 0, startY: 0, startW: 0, startH: 0
  });
  const textBoxesRef = React.useRef(textBoxes);
  textBoxesRef.current = textBoxes;
  const draggingIdxRef = React.useRef(draggingIdx);
  draggingIdxRef.current = draggingIdx;
  const resizingIdxRef = React.useRef(resizingIdx);
  resizingIdxRef.current = resizingIdx;

  const bringToFront = (idx: number) => {
    setTextBoxes(prev => {
      const maxZ = getMaxZIndex();
      const newBoxes = prev.map((box, i) =>
        i === idx ? { ...box, zIndex: maxZ + 1 } : box
      );
      // 서버에도 zIndex 변경 이벤트 전송 (필요 시)
      return newBoxes;
    });
  };
  
  React.useEffect(() => {
    if (focusedIdx !== null && inputRefs.current[focusedIdx]) {
      inputRefs.current[focusedIdx]!.focus();
      const len = inputRefs.current[focusedIdx]!.value.length;
      inputRefs.current[focusedIdx]!.setSelectionRange(len, len);
    }
  }, [focusedIdx, textBoxes.length]);

  const handleTextBoxChange = (idx: number, value: string) => {
    setTextBoxes(prev => prev.map((box, i) => (i === idx ? { ...box, text: value } : box)));
    const node = textBoxes[idx].node;
    if (node) {
      socketRef.current?.emit("textEvent", { fnc: "update", node, cContent: value, type: "text" });
    }
  };

  const handleDelete = (idx: number) => {
    const node = textBoxes[idx].node;
    if (node) {
      socketRef.current?.emit("textEvent", { fnc: "delete", node, type: "text" });
    }
    setTextBoxes(prev => prev.filter((_, i) => i !== idx));
    if (focusedIdx === idx) setFocusedIdx(null);
  };

  const handleDragStart = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setDraggingIdx(idx);
    dragOffset.current = { x: e.clientX - textBoxesRef.current[idx].x, y: e.clientY - textBoxesRef.current[idx].y };
    window.addEventListener("mousemove", handleDragging);
    window.addEventListener("mouseup", handleDragOrResizeEnd);
  };

  const handleDragging = useCallback((e: MouseEvent) => {
    const idx = draggingIdxRef.current;
    if (idx === null || !mainAreaRef.current) return;
    const rect = mainAreaRef.current.getBoundingClientRect();
    const box = textBoxesRef.current[idx];
    const newX = Math.max(0, Math.min(e.clientX - dragOffset.current.x, rect.width - box.width));
    const newY = Math.max(0, Math.min(e.clientY - dragOffset.current.y, rect.height - box.height));
    setTextBoxes(prev => prev.map((b, i) => i === idx ? { ...b, x: newX, y: newY } : b));
  }, [mainAreaRef, setTextBoxes]);

  const handleResizeStart = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setResizingIdx(idx);
    resizeStart.current = { startX: e.clientX, startY: e.clientY, startW: textBoxesRef.current[idx].width, startH: textBoxesRef.current[idx].height };
    window.addEventListener("mousemove", handleResizing);
    window.addEventListener("mouseup", handleDragOrResizeEnd);
  };

  const handleResizing = useCallback((e: MouseEvent) => {
    const idx = resizingIdxRef.current;
    if (idx === null || !mainAreaRef.current) return;
    const rect = mainAreaRef.current.getBoundingClientRect();
    const { startX, startY, startW, startH } = resizeStart.current;
    const newWidth = Math.max(MIN_WIDTH, Math.min(startW + (e.clientX - startX), rect.width - textBoxesRef.current[idx].x));
    const newHeight = Math.max(MIN_HEIGHT, Math.min(startH + (e.clientY - startY), rect.height - textBoxesRef.current[idx].y));
    setTextBoxes(prev => prev.map((b, i) => i === idx ? { ...b, width: newWidth, height: newHeight } : b));
  }, [mainAreaRef, setTextBoxes]);

  const handleDragOrResizeEnd = useCallback(() => {
    const idx = draggingIdxRef.current ?? resizingIdxRef.current;
    if (idx !== null) {
      const box = textBoxesRef.current[idx];
      socketRef.current?.emit("textEvent", {
        fnc: "move", node: box.node, type: "text",
        cLocate: { x: box.x, y: box.y }, cScale: { width: box.width, height: box.height }
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
      {textBoxes.map((box, idx) => (
        <TextBoxWrap
          key={box.node || idx}
          focused={focusedIdx === idx}
          style={{ left: box.x, top: box.y, width: box.width, height: box.height, zIndex: box.zIndex ?? 1 }}
          tabIndex={0}
          onFocus={() => { setFocusedIdx(idx); bringToFront(idx); }}
          onMouseDown={() => bringToFront(idx)}
          onBlur={e => {
            if (toolbarRef.current?.contains(e.relatedTarget as Node)) return;
            setFocusedIdx(cur => (cur === idx ? null : cur));
          }}
        >
          <TextBoxInput
            ref={el => { inputRefs.current[idx] = el; }}
            width={box.width}
            height={box.height}
            value={box.text}
            onChange={(e) => handleTextBoxChange(idx, e.target.value)}
            style={{ color: box.color, fontSize: `${box.size}px`, fontFamily: box.font }}
            $focused={focusedIdx === idx}
          />
          {focusedIdx === idx && (
            <>
              <ButtonGroup>
                <CircleBtn color="#00d26a" title="이동" onMouseDown={(e) => handleDragStart(idx, e)} />
                <CircleBtn color="#ff4a4a" title="삭제" onMouseDown={(e) => { e.stopPropagation(); handleDelete(idx); }} />
              </ButtonGroup>
              <ResizeHandle onMouseDown={(e) => handleResizeStart(idx, e)} />
            </>
          )}
        </TextBoxWrap>
      ))}
    </>
  );
};

const TextBoxWrap = styled.div<{ focused: boolean }>`
  position: absolute;
  min-width: ${MIN_WIDTH}px;
  min-height: ${MIN_HEIGHT}px;
  background: transparent;
  border: 2px solid ${({ focused }) => (focused ? 'rgba(107, 91, 149, 0.5)' : 'transparent')};
  border-radius: 4px;
  box-sizing: border-box;
  padding: 0;
  &:hover {
    border-color: ${({ focused }) => (focused ? '#6b5b95' : 'transparent')};
  }
`;

export default TextBoxes;