let startTime;
window.opener.postMessage('READY', '*');

window.onmessage = async (e) => {
  const { audioData, imageData } = e.data;
  const audio = new Audio(audioData);
  const img = new Image();
  img.src = imageData;

  img.onload = () => {
    startTime = Date.now();
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');
    const progressBar = document.getElementById('workerBar');
    const percentTxt = document.getElementById('workerPercent');
    const timeTxt = document.getElementById('workerTime');

    // Audio Setup
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const dest = audioCtx.createMediaStreamDestination();
    const source = audioCtx.createMediaElementSource(audio);
    source.connect(dest);

    const stream = new MediaStream([
      ...canvas.captureStream(30).getVideoTracks(),
      ...dest.stream.getAudioTracks()
    ]);

    const recorder = new MediaRecorder(stream, { 
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 5000000 
    });

    const chunks = [];
    recorder.ondataavailable = ev => chunks.push(ev.data);
    
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'video.webm';
      a.click();
      window.opener.postMessage({ type: 'DONE' }, '*');
    };

    audio.ontimeupdate = () => {
      const progress = (audio.currentTime / audio.duration) * 100;
      
      // Update Worker UI
      progressBar.value = progress;
      percentTxt.innerText = Math.round(progress) + "%";

      if (progress > 0) {
        const elapsed = Date.now() - startTime;
        const totalEstimated = elapsed / (progress / 100);
        const remaining = totalEstimated - elapsed;
        timeTxt.innerText = "Remaining: " + formatTime(remaining);
      }

      // Sync back to main page
      window.opener.postMessage({ type: 'PROG', val: progress }, '*');
    };

    recorder.start();
    audio.play();

    function render() {
      ctx.drawImage(img, 0, 0, 1280, 720);
      if (!audio.ended) requestAnimationFrame(render);
      else recorder.stop();
    }
    render();
  };
};

function formatTime(ms) {
  if (ms < 0) return "00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}