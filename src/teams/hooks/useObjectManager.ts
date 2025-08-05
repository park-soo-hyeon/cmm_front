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

    // 초기 데이터 수신
    const onInit = (data: any) => {
      setTextBoxes(data.texts || []);
      setVoteBoxes(data.votes || []);
      setImageBoxes(data.images || []);
    };

    // 텍스트 박스 이벤트
    const onAddTextBox = (data: TextBox) => setTextBoxes(prev => [...prev, data]);
    const onUpdateTextBox = (data: TextBox) => setTextBoxes(prev => prev.map(box => box.node === data.node ? { ...box, ...data } : box));
    const onMoveTextBox = (data: TextBox) => setTextBoxes(prev => prev.map(box => box.node === data.node ? { ...box, x: data.cLocate.x, y: data.cLocate.y, width: data.cScale.width, height: data.cScale.height } : box));
    const onRemoveTextBox = (data: { node: string }) => setTextBoxes(prev => prev.filter(box => box.node !== data.node));

    // 투표 박스 이벤트
    const onAddVote = (data: VoteBox) => setVoteBoxes(prev => [...prev, data]);
    const onUpdateVote = (data: VoteBox) => setVoteBoxes(prev => prev.map(box => box.node === data.node ? { ...box, title: data.cTitle, list: data.cList } : box));
    const onMoveVote = (data: VoteBox) => setVoteBoxes(prev => prev.map(box => box.node === data.node ? { ...box, x: data.cLocate.x, y: data.cLocate.y, width: data.cScale.width, height: data.cScale.height } : box));
    const onRemoveVote = (data: { node: string }) => setVoteBoxes(prev => prev.filter(box => box.node !== data.node));
    const onChoiceVote = (data: any) => {
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
    };

    // 이미지 박스 이벤트
    const onAddImage = (data: ImageBox) => setImageBoxes(prev => [...prev, data]);
    const onMoveImage = (data: ImageBox) => setImageBoxes(prev => prev.map(box => box.node === data.node ? { ...box, x: data.cLocate.x, y: data.cLocate.y, width: data.cScale.width, height: data.cScale.height } : box));
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
      socket.off("init");
      socket.off("addTextBox");
      socket.off("updateTextBox");
      socket.off("moveTextBox");
      socket.off("removeTextBox");
      socket.off("addVote");
      socket.off("updateVote");
      socket.off("moveVote");
      socket.off("removeVote");
      socket.off("choiceVote");
      socket.off("addImage");
      socket.off("moveImage");
      socket.off("removeImage");
    };
  }, [socket]);

  return { textBoxes, setTextBoxes, voteBoxes, setVoteBoxes, imageBoxes, setImageBoxes };
};