import React from 'react';
import {
  ModalBackdrop,
  ModalContainer,
  ModalHeader,
  ModalContent,
  CloseButton,
} from '../Team.styles'; // 스타일 파일의 위치에 따라 경로를 조정하세요.

// 컴포넌트의 props 타입을 정의합니다.
interface SummaryModalProps {
  children: React.ReactNode;
  onClose: () => void;
}

const SummaryModal: React.FC<SummaryModalProps> = ({ children, onClose }) => {
  return (
    <ModalBackdrop onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h3>AI 요약</h3>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>
        <ModalContent>{children}</ModalContent>
      </ModalContainer>
    </ModalBackdrop>
  );
};

export default SummaryModal;