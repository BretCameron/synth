const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const mainGainNode = audioContext.createGain();
const pressedNotes = new Map();

const PRESSED_CLASS = "pressed";

const setup = () => {
  mainGainNode.connect(audioContext.destination);
  mainGainNode.gain.value = 0.2;
};

const getHz = (note = "A", octave = 4) => {
  const A4 = 440;
  let N = 0;

  switch (note) {
    case "A":
      N = 0;
      break;
    case "A#":
    case "Bb":
      N = 1;
      break;
    case "B":
      N = 2;
      break;
    case "C":
      N = 3;
      break;
    case "C#":
    case "Db":
      N = 4;
      break;
    case "D":
      N = 5;
      break;
    case "D#":
    case "Eb":
      N = 6;
      break;
    case "E":
      N = 7;
      break;
    case "F":
      N = 8;
      break;
    case "F#":
    case "Gb":
      N = 9;
      break;
    case "G":
      N = 10;
      break;
    case "G#":
    case "Ab":
      N = 11;
      break;
    default:
      return 0;
  }

  N += 12 * (octave - 4);
  return A4 * Math.pow(2, N / 12);
};

const playKey = (e) => {
  const key = e.key.toUpperCase();
  if (!key || pressedNotes.get(key)) {
    return;
  }

  const osc = audioContext.createOscillator();
  const noteGainNode = audioContext.createGain();
  noteGainNode.connect(audioContext.destination);
  noteGainNode.gain.value = 0.0001;

  const setAttack = () =>
    noteGainNode.gain.exponentialRampToValueAtTime(
      0.1,
      audioContext.currentTime + 0.01
    );
  const setDecay = () =>
    noteGainNode.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + 1
    );
  const setRelease = () =>
    noteGainNode.gain.exponentialRampToValueAtTime(
      0.00001,
      audioContext.currentTime + 2
    );

  setAttack();
  setDecay();
  setRelease();

  osc.connect(noteGainNode);
  osc.type = "triangle";

  const freq = keys[key].frequency;
  keys[key].element.classList.add(PRESSED_CLASS);

  if (Number.isFinite(freq)) {
    osc.frequency.value = freq;
  }
  pressedNotes.set(key, osc);
  pressedNotes.get(key).start();
};

const stopKey = (e) => {
  const key = e.key.toUpperCase();
  keys[key].element.classList.remove(PRESSED_CLASS);

  const osc = pressedNotes.get(key);
  if (osc) {
    setTimeout(() => {
      osc.stop();
    }, 2000);
    pressedNotes.delete(key);
  }
};

const getElementByNote = (note) =>
  note && document.querySelector(`[note="${note}"]`);

const keys = {
  A: { element: getElementByNote("C"), frequency: getHz("C") },
  W: { element: getElementByNote("C#"), frequency: getHz("C#") },
  S: { element: getElementByNote("D"), frequency: getHz("D") },
  E: { element: getElementByNote("D#"), frequency: getHz("D#") },
  D: { element: getElementByNote("E"), frequency: getHz("E") },
  F: { element: getElementByNote("F"), frequency: getHz("F") },
  T: { element: getElementByNote("F#"), frequency: getHz("F#") },
  G: { element: getElementByNote("G"), frequency: getHz("G") },
  Y: { element: getElementByNote("G#"), frequency: getHz("G#") },
  H: { element: getElementByNote("A"), frequency: getHz("A", 5) },
  U: { element: getElementByNote("A#"), frequency: getHz("A#", 5) },
  J: { element: getElementByNote("B"), frequency: getHz("B", 5) },
  K: { element: getElementByNote("C2"), frequency: getHz("C", 5) },
  O: { element: getElementByNote("C#2"), frequency: getHz("C#", 5) },
  L: { element: getElementByNote("D2"), frequency: getHz("D", 5) },
};

setup();

document.addEventListener("keydown", playKey);
document.addEventListener("keyup", stopKey);
