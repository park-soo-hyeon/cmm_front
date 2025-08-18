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

  const onInit = useCallback((data: any) => {
    console.log('%c[STATE UPDATE] Initializing/Switching Project objects...', 'color: purple; font-size: 14px;');
    setTextBoxes(data.texts || []);
    setVoteBoxes(data.votes || []);
    setImageBoxes(data.images || []);
  }, []);

  const onAddTextBox = useCallback((data: any) => {
    setTextBoxes(prev => [...prev, { 
      node: data.node, tId: data.tId, pId: data.pId, uId: data.uId, 
      x: data.cLocate.x, y: data.cLocate.y, width: data.cScale.width, 
      height: data.cScale.height, text: data.cContent, font: data.cFont, 
      color: data.cColor, size: data.cSize 
    }]);
  }, []);
    
  const onUpdateTextBox = useCallback((data: any) => {
    setTextBoxes(prev => prev.map(box => box.node === data.node ? { ...box, 
        text: data.cContent !== undefined ? data.cContent : box.text,
        font: data.cFont !== undefined ? data.cFont : box.font,
        color: data.cColor !== undefined ? data.cColor : box.color,
        size: data.cSize !== undefined ? data.cSize : box.size
      } : box));
  }, []);

  const onMoveTextBox = useCallback((data: any) => {
    setTextBoxes(prev => prev.map(box => 
      box.node === data.node 
        ? { ...box, x: data.cLocate.x, y: data.cLocate.y, width: data.cScale.width, height: data.cScale.height }
        : box
    ));
  }, []);

  const onRemoveTextBox = useCallback((data: { node: string }) => {
    setTextBoxes(prev => prev.filter(box => box.node !== data.node));
  }, []);
    
  // Vote 관련 핸들러들 (생략)
  const onAddVote = useCallback((data: any) => {
    setVoteBoxes(prev => [...prev, { 
      node: data.node, tId: data.tId, pId: data.pId, uId: data.uId, 
      x: data.cLocate.x, y: data.cLocate.y, width: data.cScale.width, 
      height: data.cScale.height, title: data.cTitle, list: data.cList, 
      count: [0,0,0,0], users: [] 
    }]);
  }, []);
  const onUpdateVote = useCallback((data: any) => {
    setVoteBoxes(prev => prev.map(box => 
      box.node === data.node ? { ...box, title: data.cTitle, list: data.cList } : box
    ));
  }, []);
  const onMoveVote = useCallback((data: any) => {
    setVoteBoxes(prev => prev.map(box => 
      box.node === data.node ? { ...box, x: data.cLocate.x, y: data.cLocate.y, width: data.cScale.width, height: data.cScale.height } : box
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
    
  // Image 관련 핸들러들 (생략)
  const onAddImage = useCallback((data: any) => {
    setImageBoxes(prev => [...prev, { 
      ...data, x: data.cLocate.x, y: data.cLocate.y, 
      width: data.cScale.width, height: data.cScale.height 
    }]);
  }, []);
  const onMoveImage = useCallback((data: any) => {
    setImageBoxes(prev => prev.map(box => 
      box.node === data.node ? { ...box, x: data.cLocate.x, y: data.cLocate.y, width: data.cScale.width, height: data.cScale.height } : box
    ));
  }, []);
  const onRemoveImage = useCallback((data: { node: string }) => {
    setImageBoxes(prev => prev.filter(box => box.node !== data.node));
  }, []);


  useEffect(() => {
    if (!socket) return;

    // 이벤트 리스너 등록
    socket.on("init", onInit);
    socket.on("project-init", onInit); // 👈 **핵심 수정 사항**
    
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

    return () => {
      socket.off("init", onInit);
      socket.off("project-init", onInit); // 👈 **핵심 수정 사항**

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