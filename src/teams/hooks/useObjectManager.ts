import { useState, useEffect, useCallback } from 'react';
import { Socket } from 'socket.io-client';

type TextBox = any;
type VoteBox = any;
type ImageBox = any;
type VoteUser = { uId: string, num: number };

export const useObjectManager = (socket: Socket | null) => {
  const [textBoxes, setTextBoxes] = useState<TextBox[]>([]);
  const [voteBoxes, setVoteBoxes] = useState<VoteBox[]>([]);
  const [imageBoxes, setImageBoxes] = useState<ImageBox[]>([]);

  // ✅ useCallback을 사용하여 함수들을 메모이제이션하고 의존성을 제거
  const onInit = useCallback((data: any) => {
    console.log('%c[STATE UPDATE] Initializing objects...', 'color: purple; font-size: 14px;');
    setTextBoxes(data.texts || []);
    setVoteBoxes(data.votes || []);
    setImageBoxes(data.images || []);
  }, []);

  const onAddTextBox = useCallback((data: any) => {
    console.log('%c[HANDLER CALLED] Adding text box:', 'color: blue; font-size: 14px;', data);
    setTextBoxes(prev => {
      const newBox = { 
        node: data.node, 
        tId: data.tId, 
        pId: data.pId, 
        uId: data.uId, 
        x: data.cLocate.x, 
        y: data.cLocate.y, 
        width: data.cScale.width, 
        height: data.cScale.height, 
        text: data.cContent, 
        font: data.cFont, 
        color: data.cColor, 
        size: data.cSize 
      };
      const newState = [...prev, newBox];
      console.log('%c[STATE CHANGED] TextBoxes added.', 'color: green;', { added: newBox, newState });
      return newState;
    });
  }, []);
    
  const onUpdateTextBox = useCallback((data: any) => {
    console.log('%c[HANDLER CALLED] Trying to update text box:', 'color: red; font-size: 14px;', data);
    setTextBoxes(prev => {
      const newState = prev.map(box => {
        if (box.node === data.node) {
          const updatedBox = { 
            ...box, 
            text: data.cContent !== undefined ? data.cContent : box.text,
            font: data.cFont !== undefined ? data.cFont : box.font,
            color: data.cColor !== undefined ? data.cColor : box.color,
            size: data.cSize !== undefined ? data.cSize : box.size
          };
          console.log('%c[BOX UPDATED]', 'color: orange;', { from: box, to: updatedBox });
          return updatedBox;
        }
        return box;
      });
      console.log('%c[STATE CHANGED] TextBoxes updated.', 'color: green;', { from: prev, to: newState });
      return newState;
    });
  }, []);

  const onMoveTextBox = useCallback((data: any) => {
    console.log('%c[HANDLER CALLED] Moving text box:', 'color: blue; font-size: 14px;', data);
    setTextBoxes(prev => prev.map(box => 
      box.node === data.node 
        ? { ...box, x: data.cLocate.x, y: data.cLocate.y, width: data.cScale.width, height: data.cScale.height }
        : box
    ));
  }, []);

  const onRemoveTextBox = useCallback((data: { node: string }) => {
    console.log('%c[HANDLER CALLED] Removing text box:', 'color: red; font-size: 14px;', data);
    setTextBoxes(prev => prev.filter(box => box.node !== data.node));
  }, []);
    
  // Vote 관련 핸들러들
  const onAddVote = useCallback((data: any) => {
    setVoteBoxes(prev => [...prev, { 
      node: data.node, 
      tId: data.tId, 
      pId: data.pId, 
      uId: data.uId, 
      x: data.cLocate.x, 
      y: data.cLocate.y, 
      width: data.cScale.width, 
      height: data.cScale.height, 
      title: data.cTitle, 
      list: data.cList, 
      count: [0,0,0,0], 
      users: [] 
    }]);
  }, []);

  const onUpdateVote = useCallback((data: any) => {
    setVoteBoxes(prev => prev.map(box => 
      box.node === data.node 
        ? { ...box, title: data.cTitle, list: data.cList }
        : box
    ));
  }, []);

  const onMoveVote = useCallback((data: any) => {
    setVoteBoxes(prev => prev.map(box => 
      box.node === data.node 
        ? { ...box, x: data.cLocate.x, y: data.cLocate.y, width: data.cScale.width, height: data.cScale.height }
        : box
    ));
  }, []);

  const onRemoveVote = useCallback((data: { node: string }) => {
    setVoteBoxes(prev => prev.filter(box => box.node !== data.node));
  }, []);

  const onChoiceVote = useCallback((data: any) => { 
    setVoteBoxes(prev => prev.map(box => { 
      if (box.node === data.node) { 
        const newUsers = [ 
          ...box.users.filter((u: VoteUser) => u.uId !== data.user), 
          ...(data.num >= 1 && data.num <= 4 ? [{ uId: data.user, num: data.num }] : []) 
        ]; 
        return { ...box, count: data.count, users: newUsers }; 
      } 
      return box; 
    }));
  }, []);
    
  // Image 관련 핸들러들
  const onAddImage = useCallback((data: any) => {
    setImageBoxes(prev => [...prev, { 
      ...data, 
      x: data.cLocate.x, 
      y: data.cLocate.y, 
      width: data.cScale.width, 
      height: data.cScale.height 
    }]);
  }, []);

  const onMoveImage = useCallback((data: any) => {
    setImageBoxes(prev => prev.map(box => 
      box.node === data.node 
        ? { ...box, x: data.cLocate.x, y: data.cLocate.y, width: data.cScale.width, height: data.cScale.height }
        : box
    ));
  }, []);

  const onRemoveImage = useCallback((data: { node: string }) => {
    setImageBoxes(prev => prev.filter(box => box.node !== data.node));
  }, []);

  useEffect(() => {
    if (!socket) {
      console.log('%c[SOCKET] Socket is null, skipping event registration', 'color: red;');
      return;
    }

    console.log('%c[SOCKET] Registering event listeners...', 'color: blue;');

    // ✅ 모든 이벤트를 로그로 확인
    const handleAnyEvent = (eventName: string, ...args: any[]) => {
      // WebRTC 관련 이벤트는 너무 많으니 로그에서 제외
      if (eventName.startsWith('webrtc-') || eventName.startsWith('existing-') || eventName.startsWith('user-')) return;
      
      console.log(`%c[CLIENT RECEIVES] Event: ${eventName}`, 'color: purple; font-weight: bold;', ...args);
    };
    socket.onAny(handleAnyEvent);

    // 이벤트 리스너 등록
    socket.on("init", onInit);
    socket.on("addTextBox", onAddTextBox);
    socket.on("updateTextBox", onUpdateTextBox);
    socket.on("moveTextBox", onMoveTextBox);
    socket.on("removeTextBox", onRemoveTextBox);
    socket.on("addVote", onAddVote);
    socket.on("updateVote", onUpdateVote);
    socket.on("moveVote", onMoveVote);
    socket.on("removeVote", onRemoveVote);
    socket.on("choiceVote", onChoiceVote);
    socket.on("addImage", onAddImage);
    socket.on("moveImage", onMoveImage);
    socket.on("removeImage", onRemoveImage);

    // ✅ 소켓 연결 상태 확인
    console.log('%c[SOCKET] Socket connected:', socket.connected, 'Socket ID:', socket.id);

    // 클린업 함수
    return () => {
      console.log('%c[SOCKET] Cleaning up event listeners...', 'color: orange;');
      socket.offAny(handleAnyEvent);
      socket.off("init", onInit);
      socket.off("addTextBox", onAddTextBox);
      socket.off("updateTextBox", onUpdateTextBox);
      socket.off("moveTextBox", onMoveTextBox);
      socket.off("removeTextBox", onRemoveTextBox);
      socket.off("addVote", onAddVote);
      socket.off("updateVote", onUpdateVote);
      socket.off("moveVote", onMoveVote);
      socket.off("removeVote", onRemoveVote);
      socket.off("choiceVote", onChoiceVote);
      socket.off("addImage", onAddImage);
      socket.off("moveImage", onMoveImage);
      socket.off("removeImage", onRemoveImage);
    };
  }, [socket, onInit, onAddTextBox, onUpdateTextBox, onMoveTextBox, onRemoveTextBox, 
      onAddVote, onUpdateVote, onMoveVote, onRemoveVote, onChoiceVote,
      onAddImage, onMoveImage, onRemoveImage]);

  return { textBoxes, setTextBoxes, voteBoxes, setVoteBoxes, imageBoxes, setImageBoxes };
};