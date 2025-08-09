import { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';

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

    // ✅ [로그 추가 1] 서버에서 오는 모든 이벤트를 여기서 확인합니다.
    const handleAnyEvent = (eventName: string, ...args: any[]) => {
      // WebRTC 관련 이벤트는 너무 많으니 로그에서 제외
      if (eventName.startsWith('webrtc-') || eventName.startsWith('existing-') || eventName.startsWith('user-')) return;
      
      console.log(`[CLIENT RECEIVES] Event: ${eventName}, Data:`, ...args);
    };
    socket.onAny(handleAnyEvent);


    const onInit = (data: any) => {
      console.log('%c[STATE UPDATE] Initializing objects...', 'color: purple; font-size: 14px;');
      setTextBoxes(data.texts || []);
      setVoteBoxes(data.votes || []);
      setImageBoxes(data.images || []);
    };

    // --- 서버 데이터 형식(c...)을 클라이언트 형식(...)으로 변환하는 핸들러 ---
    const onAddTextBox = (data: any) => setTextBoxes(prev => [...prev, { node: data.node, tId: data.tId, pId: data.pId, uId: data.uId, x: data.cLocate.x, y: data.cLocate.y, width: data.cScale.width, height: data.cScale.height, text: data.cContent, font: data.cFont, color: data.cColor, size: data.cSize }]);
    
    const onUpdateTextBox = (data: any) => {
      // ✅ [로그 추가 2] 이 로그가 보인다면, 이벤트 수신 후 상태 변경 함수가 실행된 것입니다.
      console.log('%c[HANDLER CALLED] Trying to update text box:', 'color: red; font-size: 14px;', data);
      setTextBoxes(prev => {
        const newState = prev.map(box => box.node === data.node ? { ...box, text: data.cContent, font: data.cFont, color: data.cColor, size: data.cSize } : box);
        console.log('%c[STATE CHANGED] TextBoxes updated.', 'color: green;', { from: prev, to: newState });
        return newState;
      });
    };

    const onMoveTextBox = (data: any) => setTextBoxes(prev => prev.map(box => box.node === data.node ? { ...box, x: data.cLocate.x, y: data.cLocate.y, width: data.cScale.width, height: data.cScale.height } : box));
    const onRemoveTextBox = (data: { node: string }) => setTextBoxes(prev => prev.filter(box => box.node !== data.node));
    
    const onAddVote = (data: any) => setVoteBoxes(prev => [...prev, { node: data.node, tId: data.tId, pId: data.pId, uId: data.uId, x: data.cLocate.x, y: data.cLocate.y, width: data.cScale.width, height: data.cScale.height, title: data.cTitle, list: data.cList, count: [0,0,0,0], users: [] }]);
    const onUpdateVote = (data: any) => setVoteBoxes(prev => prev.map(box => box.node === data.node ? { ...box, title: data.cTitle, list: data.cList } : box));
    const onMoveVote = (data: any) => setVoteBoxes(prev => prev.map(box => box.node === data.node ? { ...box, x: data.cLocate.x, y: data.cLocate.y, width: data.cScale.width, height: data.cScale.height } : box));
    const onRemoveVote = (data: { node: string }) => setVoteBoxes(prev => prev.filter(box => box.node !== data.node));
    const onChoiceVote = (data: any) => { setVoteBoxes(prev => prev.map(box => { if (box.node === data.node) { const newUsers = [ ...box.users.filter((u: VoteUser) => u.uId !== data.user), ...(data.num >= 1 && data.num <= 4 ? [{ uId: data.user, num: data.num }] : []) ]; return { ...box, count: data.count, users: newUsers }; } return box; })); };
    
    const onAddImage = (data: any) => setImageBoxes(prev => [...prev, { ...data, x: data.cLocate.x, y: data.cLocate.y, width: data.cScale.width, height: data.cScale.height }]);
    const onMoveImage = (data: any) => setImageBoxes(prev => prev.map(box => box.node === data.node ? { ...box, x: data.cLocate.x, y: data.cLocate.y, width: data.cScale.width, height: data.cScale.height } : box));
    const onRemoveImage = (data: { node: string }) => setImageBoxes(prev => prev.filter(box => box.node !== data.node));

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

    // 클린업 함수
    return () => {
      socket.offAny(handleAnyEvent);
      socket.off("init");
      ["addTextBox", "updateTextBox", "moveTextBox", "removeTextBox"].forEach(e => socket.off(e));
      ["addVote", "updateVote", "moveVote", "removeVote", "choiceVote"].forEach(e => socket.off(e));
      ["addImage", "moveImage", "removeImage"].forEach(e => socket.off(e));
    };
  }, [socket]);

  return { textBoxes, setTextBoxes, voteBoxes, setVoteBoxes, imageBoxes, setImageBoxes };
};