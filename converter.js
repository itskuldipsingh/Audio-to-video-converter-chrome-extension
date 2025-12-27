let startTime;

document.getElementById('startBtn').onclick = async () => {
  const audioFile = document.getElementById('audio').files[0];
  const imageFile = document.getElementById('image').files[0];

  if (!audioFile || !imageFile) return alert("Please select both files.");

  document.getElementById('startBtn').disabled = true;
  document.getElementById('progSection').style.display = "block";

  const toBase64 = file => new Promise(res => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.readAsDataURL(file);
  });

  const audioData = await toBase64(audioFile);
  const imageData = await toBase64(imageFile);

  const workerTab = window.open('worker.html', '_blank');

  window.addEventListener('message', (event) => {
    if (event.data === 'READY') {
      startTime = Date.now(); // Record start time
      workerTab.postMessage({ audioData, imageData }, '*');
      document.getElementById('status').innerText = "Converting... Keep worker tab open.";
    }

    if (event.data.type === 'PROG') {
      const progress = event.data.val;
      document.getElementById('bar').value = progress;
      document.getElementById('percentTxt').innerText = Math.round(progress) + "%";

      // Calculate Time Remaining
      if (progress > 0) {
        const elapsed = Date.now() - startTime;
        const totalEstimatedTime = elapsed / (progress / 100);
        const remaining = totalEstimatedTime - elapsed;
        document.getElementById('timeTxt').innerText = "Time Remaining: " + formatTime(remaining);
      }
    }

    if (event.data.type === 'DONE') {
      document.getElementById('status').innerText = "CONVERSION COMPLETE!";
      document.getElementById('timeTxt').innerText = "Saved to Downloads";
      document.getElementById('startBtn').disabled = false;
    }
  });
};

function formatTime(ms) {
  if (ms < 0) return "00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}