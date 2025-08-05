import { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';

type TextBox = any;
type VoteBox = any;
type ImageBox = any;

export const useObjectManager = (socket: Socket | null) => {
  const [textBoxes, setTextBoxes] = useState<TextBox[]>([]);
  const [voteBoxes, setVoteBoxes] = useState<VoteBox[]>([]);
  const [imageBoxes, setImageBoxes] = useState<ImageBox[]>([]);

  useEffect(() => {
    if (!socket) return;

    const onInit = (data: any) => {
      setTextBoxes(data.texts || []);
      setVoteBoxes(data.votes || []);
      setImageBoxes(data.images || []);
    };

    // 서버로부터 오는 모든 실시간 이벤트를 수신하여 상태에 반영
    socket.on("init", onInit);
    socket.on("addTextBox", (data) => setTextBoxes(prev => [...prev, data]));
    socket.on("updateTextBox", (data) => setTextBoxes(prev => prev.map(box => box.node === data.node ? data : box)));
    socket.on("moveTextBox", (data) => setTextBoxes(prev => prev.map(box => box.node === data.node ? { ...box, x: data.cLocate.x, y: data.cLocate.y, width: data.cScale.width, height: data.cScale.height } : box)));
    socket.on("removeTextBox", (data) => setTextBoxes(prev => prev.filter(box => box.node !== data.node)));
    
    socket.on("addVote", (data) => setVoteBoxes(prev => [...prev, data]));
    socket.on("updateVote", (data) => setVoteBoxes(prev => prev.map(box => box.node === data.node ? data : box)));
    socket.on("moveVote", (data) => setVoteBoxes(prev => prev.map(box => box.node === data.node ? { ...box, x: data.cLocate.x, y: data.cLocate.y, width: data.cScale.width, height: data.cScale.height } : box)));
    socket.on("removeVote", (data) => setVoteBoxes(prev => prev.filter(box => box.node !== data.node)));
    socket.on("choiceVote", (data) => setVoteBoxes(prev => prev.map(box => box.node === data.node ? { ...box, count: data.count, users: data.users } : box)));
    
    socket.on("addImage", (data) => setImageBoxes(prev => [...prev, data]));
    socket.on("moveImage", (data) => setImageBoxes(prev => prev.map(box => box.node === data.node ? { ...box, x: data.cLocate.x, y: data.cLocate.y, width: data.cScale.width, height: data.cScale.height } : box)));
    socket.on("removeImage", (data) => setImageBoxes(prev => prev.filter(box => box.node !== data.node)));

    return () => {
      // 모든 이벤트 리스너 정리
      socket.off("init");
      ["addTextBox", "updateTextBox", "moveTextBox", "removeTextBox"].forEach(e => socket.off(e));
      ["addVote", "updateVote", "moveVote", "removeVote", "choiceVote"].forEach(e => socket.off(e));
      ["addImage", "moveImage", "removeImage"].forEach(e => socket.off(e));
    };
  }, [socket]);

  return { textBoxes, setTextBoxes, voteBoxes, setVoteBoxes, imageBoxes, setImageBoxes };
};