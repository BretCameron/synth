const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const mainGainNode = audioContext.createGain();
const pressedNotes = new Map();

const PRESSED_CLASS = "pressed";

let octaveState = 3;

const input = document.querySelector("input");
input.addEventListener("input", updateValue);

function updateValue(e) {
  octaveState = e.target.value;
}

const setup = () => {
  mainGainNode.connect(audioContext.destination);
  mainGainNode.gain.value = 0.2;
};

const getHz = (note = "A", octave = 4) => {
  const A4 = 440;
  let N = 0;

  switch (note) {
    default:
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
  }

  N += 12 * (octave - 4);
  return A4 * Math.pow(2, N / 12);
};

const handleKeyDown = (e) => {
  const key = e.key.toUpperCase();
  if (!key || pressedNotes.get(key)) {
    return;
  }

  if (key === "Z" && octaveState > 1) {
    input.value--;
    octaveState--;
  } else if (key === "X" && octaveState < 5) {
    input.value++;
    octaveState++;
  } else {
    playKey(key);
  }
};

const handleKeyUp = (e) => {
  const key = e.key.toUpperCase();
  if (!key) {
    return;
  }
  stopKey(key);
};

const playKey = (key) => {
  if (!keys[key]) {
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

  const freq = getHz(
    keys[key].note,
    +octaveState + (keys[key].octaveOffset || 0)
  );
  keys[key].element.classList.add(PRESSED_CLASS);

  if (Number.isFinite(freq)) {
    osc.frequency.value = freq;
  }
  pressedNotes.set(key, osc);
  pressedNotes.get(key).start();

  // TODO - work out chords from notes
  const notes = Array.from(pressedNotes).map(([key]) => keys[key].note);
  console.log(notes);
};

function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

const stopKey = (key) => {
  if (!keys[key]) {
    return;
  }

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
  A: { element: getElementByNote("C"), note: "C", octaveOffset: 0 },
  W: { element: getElementByNote("C#"), note: "C#", octaveOffset: 0 },
  S: { element: getElementByNote("D"), note: "D", octaveOffset: 0 },
  E: { element: getElementByNote("D#"), note: "D#", octaveOffset: 0 },
  D: { element: getElementByNote("E"), note: "E", octaveOffset: 0 },
  F: { element: getElementByNote("F"), note: "F", octaveOffset: 0 },
  T: { element: getElementByNote("F#"), note: "F#", octaveOffset: 0 },
  G: { element: getElementByNote("G"), note: "G", octaveOffset: 0 },
  Y: { element: getElementByNote("G#"), note: "G#", octaveOffset: 0 },
  H: { element: getElementByNote("A"), note: "A", octaveOffset: 1 },
  U: { element: getElementByNote("A#"), note: "A#", octaveOffset: 1 },
  J: { element: getElementByNote("B"), note: "B", octaveOffset: 1 },
  K: { element: getElementByNote("C2"), note: "C", octaveOffset: 1 },
  O: { element: getElementByNote("C#2"), note: "C#", octaveOffset: 1 },
  L: { element: getElementByNote("D2"), note: "D", octaveOffset: 1 },
};

setup();

document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);

let clickedKey = "";

for (const [key, { element }] of Object.entries(keys)) {
  element.addEventListener("mousedown", () => {
    playKey(key);
    clickedKey = key;
  });
}

document.addEventListener("mouseup", () => {
  stopKey(clickedKey);
});
