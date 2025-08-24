import { useState, useEffect, useCallback } from 'react';
import { Socket } from 'socket.io-client';

type TextBox = any;
type VoteBox = any;
type ImageBox = any;
type VoteUser = { uId: string, num: number };

export const useObjectManager = (socket: Socket | null, userId: string) => {
  const [textBoxes, setTextBoxes] = useState<TextBox[]>([]);
  const [voteBoxes, setVoteBoxes] = useState<VoteBox[]>([]);
  const [imageBoxes, setImageBoxes] = useState<ImageBox[]>([]);
  
  // 내가 마지막으로 생성한 텍스트박스의 node ID를 저장할 상태
  const [lastCreatedByMe, setLastCreatedByMe] = useState<string | null>(null);

  const onInit = useCallback((data: any) => {
    setTextBoxes(data.texts || []);
    setVoteBoxes(data.votes || []);
    setImageBoxes(data.images || []);
    setLastCreatedByMe(null); // 프로젝트 변경 시 초기화
  }, []);

  const onAddTextBox = useCallback((data: any) => {
    // 새로 추가된 박스의 생성자가 나(userId)인지 확인
    if (data.uId === userId) {
      // 맞다면, 해당 박스의 node ID를 상태에 저장
      setLastCreatedByMe(data.node);
    }
    setTextBoxes(prev => [...prev, data]);
  }, [userId]);
    
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
    
  const onAddVote = useCallback((data: any) => {
    setVoteBoxes(prev => [...prev, data]);
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
    
  const onAddImage = useCallback((data: any) => {
    setImageBoxes(prev => [...prev, data]);
  }, []);
  const onMoveImage = useCallback((data: any) => {
    setImageBoxes(prev => prev.map(box => 
      box.node === data.node ? { ...box, x: data.cLocate.x, y: data.cLocate.y, width: data.cScale.width, height: data.cScale.height } : box
    ));
  }, []);
  const onRemoveImage = useCallback((data: { node: string }) => {
    setImageBoxes(prev => prev.filter(box => box.node !== data.node));
  }, []);

  // lastCreatedByMe를 자동으로 초기화하는 useEffect
  useEffect(() => {
    if (lastCreatedByMe) {
      const timer = setTimeout(() => {
        setLastCreatedByMe(null);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [lastCreatedByMe]);

  useEffect(() => {
    if (!socket) return;

    socket.on("init", onInit);
    socket.on("project-init", onInit);
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
      socket.off("project-init", onInit);
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

  return { textBoxes, setTextBoxes, voteBoxes, setVoteBoxes, imageBoxes, setImageBoxes, lastCreatedByMe };
};