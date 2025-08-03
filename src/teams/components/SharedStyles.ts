import styled from 'styled-components';

export const ButtonGroup = styled.div`
  position: absolute;
  top: -18px;
  right: 0;
  display: flex;
  gap: 2px;
`;

export const CircleBtn = styled.button<{ color: string }>`
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

export const ResizeHandle = styled.div`
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