// imageHandlers.js
module.exports = function imageHandlers(io, socket, {
  getCurrentTeamId,
  getCurrentProjectId,
  getCurrentUserId,
  imagesRef,
  setImages,
  queryPromise
}) {
  // 이미지 박스 생성
  socket.on('imageEvent', async (data) => {
    const { fnc } = data;
    if (fnc === 'new') {
      const newImage = {
        node: data.node,
        tId: getCurrentTeamId(),
        pId: getCurrentProjectId(),
        uId: getCurrentUserId(),
        fileName: data.fileName,
        mimeType: data.mimeType,
        x: data.cLocate.x,
        y: data.cLocate.y,
        width: data.cScale.width,
        height: data.cScale.height,
      };
      setImages([...imagesRef(), newImage]);
      io.to(String(getCurrentTeamId())).emit('addImageBox', newImage);
    }
    if (fnc === 'move') {
      setImages(imagesRef().map(img =>
        img.node === data.node
          ? { ...img, x: data.cLocate.x, y: data.cLocate.y, width: data.cScale.width, height: data.cScale.height }
          : img
      ));
      io.to(String(getCurrentTeamId())).emit('moveImageBox', {
        node: data.node,
        cLocate: data.cLocate,
        cScale: data.cScale,
      });
    }
    if (fnc === 'delete') {
      setImages(imagesRef().filter(img => img.node !== data.node));
      io.to(String(getCurrentTeamId())).emit('removeImageBox', { node: data.node });
    }
  });
};
