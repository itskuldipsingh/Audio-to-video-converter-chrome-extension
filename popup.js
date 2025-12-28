const convertBtn = document.getElementById('convertBtn');
const status = document.getElementById('status');
const progress = document.getElementById('progressBar');
const timerDisplay = document.getElementById('timer');
const canvas = document.getElementById('recordCanvas');
const formatSelect = document.getElementById('formatSelect');
const ctx = canvas.getContext('2d');

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

convertBtn.onclick = async () => {
  const audioFile = document.getElementById('audioInput').files[0];
  const imageFile = document.getElementById('imageInput').files[0];

  if (!audioFile || !imageFile) return alert("Please select both files.");

  status.innerText = "Setting up silent stream...";
  convertBtn.disabled = true;

  // 1. Prepare Canvas
  const img = new Image();
  img.src = URL.createObjectURL(imageFile);
  await img.decode();
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  // 2. Setup Audio (Muted on UI level)
  const audio = new Audio();
  audio.src = URL.createObjectURL(audioFile);
  audio.muted = true; 
  
  // 3. Web Audio API Routing (Silent)
  const canvasStream = canvas.captureStream(30); 
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const source = audioContext.createMediaElementSource(audio);
  const destination = audioContext.createMediaStreamDestination();
  
  // Connect source ONLY to recorder, bypass audioContext.destination (speakers)
  source.connect(destination); 

  const combinedStream = new MediaStream([
    ...canvasStream.getVideoTracks(),
    ...destination.stream.getAudioTracks()
  ]);

  // 4. Recorder Logic
  let mimeType = formatSelect.value;
  if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm';

  const recorder = new MediaRecorder(combinedStream, { mimeType });
  const chunks = [];

  recorder.ondataavailable = (e) => chunks.push(e.data);
  
  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: mimeType });
    const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `video_${Date.now()}.${ext}`;
    a.click();
    
    status.innerText = "Done! Video saved.";
    timerDisplay.innerText = "Remaining: 00:00";
    progress.style.display = "none";
    convertBtn.disabled = false;
    audioContext.close();
  };

  // 5. Start Recording
  audio.play().then(() => {
    recorder.start();
    progress.style.display = "block";
  });

  audio.ontimeupdate = () => {
    const percent = (audio.currentTime / audio.duration) * 100;
    const remaining = audio.duration - audio.currentTime;
    progress.value = percent;
    status.innerText = `Encoding: ${Math.round(percent)}%`;
    timerDisplay.innerText = `Remaining: ${formatTime(remaining)}`;
  };

  audio.onended = () => recorder.stop();
};
