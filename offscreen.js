chrome.runtime.onMessage.addListener(async (msg) => {
  if (msg.action === 'RUN') {
    const dbReq = indexedDB.open("ConvDB", 2);
    dbReq.onsuccess = async (e) => {
      const db = e.target.result;
      const getFile = (key) => new Promise(res => {
        db.transaction("files").objectStore("files").get(key).onsuccess = ev => res(ev.target.result);
      });

      const audioBlob = await getFile('audio');
      const imageBlob = await getFile('image');
      process(audioBlob, imageBlob);
    };
  }
});

function process(audioBlob, imageBlob) {
  const audio = new Audio(URL.createObjectURL(audioBlob));
  const img = new Image();
  img.src = URL.createObjectURL(imageBlob);

  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1280; canvas.height = 720;
    const ctx = canvas.getContext('2d');

    const audioCtx = new AudioContext();
    const dest = audioCtx.createMediaStreamDestination();
    audioCtx.createMediaElementSource(audio).connect(dest);

    const stream = new MediaStream([
      ...canvas.captureStream(30).getVideoTracks(),
      ...dest.stream.getAudioTracks()
    ]);

    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const chunks = [];
    recorder.ondataavailable = e => chunks.push(e.data);
    recorder.onstop = () => {
      const finalBlob = new Blob(chunks, { type: 'video/webm' });
      const dbReq = indexedDB.open("ConvDB", 2);
      dbReq.onsuccess = e => {
        const tx = e.target.result.transaction("files", "readwrite");
        tx.objectStore("files").put(finalBlob, 'video');
        tx.oncomplete = () => chrome.runtime.sendMessage({ action: 'FINISHED' });
      };
    };

    audio.ontimeupdate = () => {
      chrome.runtime.sendMessage({ type: 'PROG', val: (audio.currentTime / audio.duration) * 100 });
    };

    recorder.start();
    audio.play();

    function anim() {
      ctx.drawImage(img, 0, 0, 1280, 720);
      if (!audio.ended) requestAnimationFrame(anim);
      else recorder.stop();
    }
    anim();
  };
}