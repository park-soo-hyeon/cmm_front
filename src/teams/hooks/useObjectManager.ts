import { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';

// 필요한 객체 타입을 정의합니다. (any 대신 실제 타입 사용 권장)
type TextBox = any;
type VoteBox = any;
type ImageBox = any;
type VoteUser = { uId: string, num: number };

export const useObjectManager = (socket: Socket | null) => {
  const [textBoxes, setTextBoxes] = useState<TextBox[]>([]);
  const [voteBoxes, setVoteBoxes] = useState<VoteBox[]>([]);
  const [imageBoxes, setImageBoxes] = useState<ImageBox[]>([]);

  useEffect(() => {
    if (!socket) return;

    const onInit = (data: any) => {
      // 서버 init 데이터는 c가 없는 형식일 수 있으므로, 그대로 사용
      setTextBoxes(data.texts || []);
      setVoteBoxes(data.votes || []);
      setImageBoxes(data.images || []);
    };

    // --- 서버 데이터 형식(c...)을 클라이언트 형식(...)으로 변환하는 핸들러 ---

    const onAddTextBox = (data: any) => setTextBoxes(prev => [...prev, {
      node: data.node,
      tId: data.tId,
      pId: data.pId,
      x: data.cLocate.x,
      y: data.cLocate.y,
      width: data.cScale.width,
      height: data.cScale.height,
      text: data.cContent,
      font: data.cFont,
      color: data.cColor,
      size: data.cSize,
    }]);

    const onUpdateTextBox = (data: any) => setTextBoxes(prev => prev.map(box =>
      box.node === data.node
        ? { ...box, text: data.cContent, font: data.cFont, color: data.cColor, size: data.cSize }
        : box
    ));

    const onMoveTextBox = (data: any) => setTextBoxes(prev => prev.map(box =>
      box.node === data.node
        ? { ...box, x: data.cLocate.x, y: data.cLocate.y, width: data.cScale.width, height: data.cScale.height }
        : box
    ));

    const onRemoveTextBox = (data: { node: string }) => setTextBoxes(prev => prev.filter(box => box.node !== data.node));

    const onAddVote = (data: any) => setVoteBoxes(prev => [...prev, {
      node: data.node,
      tId: data.tId,
      pId: data.pId,
      x: data.cLocate.x,
      y: data.cLocate.y,
      width: data.cScale.width,
      height: data.cScale.height,
      title: data.cTitle,
      list: data.cList,
      count: [0, 0, 0, 0],
      users: []
    }]);

    const onUpdateVote = (data: any) => setVoteBoxes(prev => prev.map(box =>
        box.node === data.node
        ? { ...box, title: data.cTitle, list: data.cList }
        : box
    ));
    
    // choiceVote는 서버에서 count, users를 보내주므로 그대로 사용
    const onChoiceVote = (data: any) => setVoteBoxes(prev => prev.map(box => box.node === data.node ? { ...box, count: data.count, users: data.users } : box));
    
    const onMoveVote = onMoveTextBox; // 텍스트와 로직 동일
    const onRemoveVote = onRemoveTextBox; // 텍스트와 로직 동일

    const onAddImage = (data: any) => setImageBoxes(prev => [...prev, { ...data, x: data.cLocate.x, y: data.cLocate.y, width: data.cScale.width, height: data.cScale.height }]);
    const onMoveImage = onMoveTextBox; // 텍스트와 로직 동일
    const onRemoveImage = onRemoveTextBox; // 텍스트와 로직 동일


    // --- 이벤트 리스너 등록 ---
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

    // 클린업 함수
    return () => {
      socket.off("init");
      ["addTextBox", "updateTextBox", "moveTextBox", "removeTextBox"].forEach(e => socket.off(e));
      ["addVote", "updateVote", "moveVote", "removeVote", "choiceVote"].forEach(e => socket.off(e));
      ["addImage", "moveImage", "removeImage"].forEach(e => socket.off(e));
    };
  }, [socket]);

  return { textBoxes, setTextBoxes, voteBoxes, setVoteBoxes, imageBoxes, setImageBoxes };
};