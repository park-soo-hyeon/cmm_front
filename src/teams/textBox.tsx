import React, { useCallback } from "react";
import styled from "styled-components";
import { Socket } from "socket.io-client";


// 1. forwardRef로 textarea 래핑
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

// 2. styled-components로 스타일 추가
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
  x: number; 
  y: number; 
  text: string; 
  width: number; 
  height: number;
  color: string;
  size: number;
  font: string;
  node?: string;
  zIndex?: number; // 추가
};


interface TextBoxesProps {
  textBoxes: TextBox[];
  setTextBoxes: React.Dispatch<React.SetStateAction<TextBox[]>>;
  focusedIdx: number | null;
  setFocusedIdx: React.Dispatch<React.SetStateAction<number | null>>;
  draggingIdx: number | null;
  setDraggingIdx: React.Dispatch<React.SetStateAction<number | null>>;
  isTextMode: boolean;
  setIsTextMode: React.Dispatch<React.SetStateAction<boolean>>;
  resizingIdx: number | null;
  setResizingIdx: React.Dispatch<React.SetStateAction<number | null>>;
  textColor: string;
  setTextColor: React.Dispatch<React.SetStateAction<string>>;
  fontSize: number;
  setFontSize: React.Dispatch<React.SetStateAction<number>>;
  fontFamily: string;
  setFontFamily: React.Dispatch<React.SetStateAction<string>>;
  fontSizeInput: string;
  setFontSizeInput: React.Dispatch<React.SetStateAction<string>>;
  mainAreaRef: React.RefObject<HTMLDivElement | null>;
  socketRef: React.RefObject<Socket | null>;
  toolbarRef: React.RefObject<HTMLDivElement | null>;
  getMaxZIndex: () => number;
}

const MIN_WIDTH = 50;
const MIN_HEIGHT = 30;

const TextBoxes: React.FC<TextBoxesProps> = ({
  getMaxZIndex,
  isTextMode,
  setIsTextMode,
  textBoxes,
  setTextBoxes,
  focusedIdx,
  setFocusedIdx,
  draggingIdx,
  setDraggingIdx,
  resizingIdx,
  setResizingIdx,
  textColor,
  setTextColor,
  fontSize,
  setFontSize,
  fontFamily,
  setFontFamily,
  fontSizeInput,
  setFontSizeInput,
  mainAreaRef,
  socketRef,
  toolbarRef,
}) => {

  const bringToFront = (idx: number) => {
  setTextBoxes(prev => {
    const maxZ = getMaxZIndex();
    return prev.map((box, i) =>
      i === idx ? { ...box, zIndex: maxZ + 1 } : box
    );
  });
};
  // 드래그/리사이즈용 ref
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

  React.useEffect(() => {
  if (
    focusedIdx !== null &&
    inputRefs.current[focusedIdx]
  ) {
    inputRefs.current[focusedIdx]!.focus();
    // 커서를 맨 뒤로 이동
    const len = inputRefs.current[focusedIdx]!.value.length;
    inputRefs.current[focusedIdx]!.setSelectionRange(len, len);
  }
}, [focusedIdx, textBoxes.length]);

  // 텍스트 변경
  const handleTextBoxChange = (idx: number, value: string) => {
    setTextBoxes(prev =>
      prev.map((box, i) => (i === idx ? { ...box, text:value } : box))
    );
    const node = textBoxes[idx].node;
    if (!node) return;
    socketRef.current?.emit("textEvent", {
      fnc: "update",
      node,
      cContent: value,
      cFont: textBoxes[idx].font,
      cColor: textBoxes[idx].color,
      cSize: textBoxes[idx].size,
      type: "text"
    });
  };

  // 삭제
  const handleDelete = (idx: number) => {
  const node = textBoxes[idx].node;
  if (!node) return;
  socketRef.current?.emit("textEvent", {
    fnc: "delete",
    node,
    type: "text"
  });
  setTextBoxes(prev => {
    const next = prev.filter((_, i) => i !== idx);
    // 삭제한 박스가 포커스된 박스였다면 입력모드 해제
    if (focusedIdx === idx) {
      setFocusedIdx(null);
      setIsTextMode(false); // ★ 이 줄 추가!
    }
    return next;
  });
};
  // 드래그 시작
  const handleDragStart = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setDraggingIdx(idx);
    dragOffset.current = {
      x: e.clientX - textBoxesRef.current[idx].x,
      y: e.clientY - textBoxesRef.current[idx].y,
    };
    const node = textBoxesRef.current[idx].node;
    if (node) {
      socketRef.current?.emit("textEvent", {
        fnc: "move",
        node,
        cLocate: { x: textBoxesRef.current[idx].x, y: textBoxesRef.current[idx].y },
        cScale: { width: textBoxesRef.current[idx].width, height: textBoxesRef.current[idx].height },
        type: "text"
      });
    }
    window.addEventListener("mousemove", handleDragging);
    window.addEventListener("mouseup", handleDragOrResizeEnd);
  };

  // 드래그 중
  const handleDragging = useCallback((e: MouseEvent) => {
    const idx = draggingIdxRef.current;
    if (idx === null || !mainAreaRef.current) return;
    const rect = mainAreaRef.current.getBoundingClientRect();
    const box = textBoxesRef.current[idx];
    const newX = Math.max(0, Math.min(e.clientX - dragOffset.current.x, rect.width - box.width));
    const newY = Math.max(0, Math.min(e.clientY - dragOffset.current.y, rect.height - box.height));
    setTextBoxes((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], x: newX, y: newY };
      return copy;
    });
    const node = textBoxesRef.current[idx].node;
    if (node) {
      socketRef.current?.emit("textEvent", {
        fnc: "move",
        node,
        cLocate: { x: newX, y: newY },
        cScale: { width: textBoxesRef.current[idx].width, height: textBoxesRef.current[idx].height },
        type: "text"
      });
    }
  }, [mainAreaRef, setTextBoxes, socketRef]);

  // 리사이즈 시작
  const handleResizeStart = (
    idx: number,
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    e.stopPropagation();
    e.preventDefault();
    setResizingIdx(idx);
    resizeStart.current = {
      startX: e.clientX,
      startY: e.clientY,
      startW: textBoxesRef.current[idx].width,
      startH: textBoxesRef.current[idx].height,
    };
    const node = textBoxesRef.current[idx].node;
    if (node) {
      socketRef.current?.emit("textEvent", {
        fnc: "move",
        node,
        cLocate: { x: textBoxesRef.current[idx].x, y: textBoxesRef.current[idx].y },
        cScale: { width: textBoxesRef.current[idx].width, height: textBoxesRef.current[idx].height },
        type: "text"
      });
    }
    window.addEventListener("mousemove", handleResizing);
    window.addEventListener("mouseup", handleDragOrResizeEnd);
  };

  // 리사이즈 중
  const handleResizing = useCallback((e: MouseEvent) => {
    const idx = resizingIdxRef.current;
    if (idx === null || !mainAreaRef.current) return;
    const rect = mainAreaRef.current.getBoundingClientRect();
    const { startX, startY, startW, startH } = resizeStart.current;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    const maxWidth = rect.width - textBoxesRef.current[idx].x;
    const maxHeight = rect.height - textBoxesRef.current[idx].y;
    const newWidth = Math.max(MIN_WIDTH, Math.min(startW + dx, maxWidth));
    const newHeight = Math.max(MIN_HEIGHT, Math.min(startH + dy, maxHeight));
    setTextBoxes((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], width: newWidth, height: newHeight };
      return copy;
    });
    const node = textBoxesRef.current[idx].node;
    if (node) {
      socketRef.current?.emit("textEvent", {
        fnc: "move",
        node,
        cLocate: { x: textBoxesRef.current[idx].x, y: textBoxesRef.current[idx].y },
        cScale: { width: newWidth, height: newHeight },
        type: "text"
      });
    }
  }, [mainAreaRef, setTextBoxes, socketRef]);

  // 드래그/리사이즈 종료
  const handleDragOrResizeEnd = useCallback(() => {
    setDraggingIdx(null);
    setResizingIdx(null);
    window.removeEventListener("mousemove", handleDragging);
    window.removeEventListener("mousemove", handleResizing);
    window.removeEventListener("mouseup", handleDragOrResizeEnd);
  }, [handleDragging, handleResizing]);

  // UI 렌더링
  return (
    <>
      {textBoxes.map((box, idx) => (
        <TextBoxWrap
        
    key={idx}
    focused={focusedIdx === idx} // 추가
    style={{
      left: box.x,
      top: box.y,
      width: box.width,
      height: box.height,
      zIndex: box.zIndex ?? 1
    }}
    tabIndex={0}
    onFocus={() => {setFocusedIdx(idx);
      bringToFront(idx);
    }}
    onMouseDown={() => bringToFront(idx)}
    onBlur={e => {
      if (
        toolbarRef.current &&
        e.relatedTarget &&
        toolbarRef.current.contains(e.relatedTarget as Node)
      ) {
        return;
      }
      setFocusedIdx((cur) => (cur === idx ? null : cur));
    }}
  >
          <TextBoxInput
  ref={el => { inputRefs.current[idx] = el; }}
  width={box.width}
  height={box.height}
  value={box.text}
  onChange={(e) => handleTextBoxChange(idx, e.target.value)}
  style={{
    color: box.color,
    fontSize: `${box.size}px`,
    fontFamily: box.font
  }}
  $focused={focusedIdx === idx}
/>
          {focusedIdx === idx && (
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
        </TextBoxWrap>
      ))}
    </>
  );
};

// 스타일 컴포넌트 (Team.tsx와 동일)
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

export default TextBoxes;
