const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const oscList = [];
const mainGainNode = audioContext.createGain();
const biquadFilter = audioContext.createBiquadFilter();
const convolver = audioContext.createConvolver();

function adsr(gainNode, when, adsr) {
  if (!gainNode) throw `you must pass a gain node to me, got ${gainNode}`;
  if (typeof when !== "number") throw `you must pass "when" to me, got ${when}`;
  ["peak", "mid", "end", "attack", "sustain", "release", "decay"].forEach(
    function (attr) {
      if (typeof adsr[attr] !== "number")
        throw `you must tell me the ${attr}, got ${adsr[attr]}`;
    }
  );

  gainNode.gain.exponentialRampToValueAtTime(adsr.peak, when + adsr.attack);
  gainNode.gain.exponentialRampToValueAtTime(
    adsr.mid,
    when + adsr.attack + adsr.decay
  );
  gainNode.gain.setValueAtTime(
    adsr.mid,
    when + adsr.sustain + adsr.attack + adsr.decay
  );
  gainNode.gain.exponentialRampToValueAtTime(
    adsr.end,
    when + adsr.sustain + adsr.attack + adsr.decay + adsr.release
  );
}

function setup() {
  biquadFilter.connect(convolver);
  convolver.connect(mainGainNode);
  mainGainNode.connect(audioContext.destination);
  mainGainNode.gain.value = 0.2;

  biquadFilter.type = "lowshelf";
  biquadFilter.frequency.setValueAtTime(1000, audioContext.currentTime);
  biquadFilter.gain.setValueAtTime(100, audioContext.currentTime);
}

setup();

const C = document.querySelectorAll('[note="C"]')[0];
const Csharp = document.querySelectorAll('[note="C#"]')[0];
const D = document.querySelectorAll('[note="D"]')[0];
const Dsharp = document.querySelectorAll('[note="D#"]')[0];
const E = document.querySelectorAll('[note="E"]')[0];
const F = document.querySelectorAll('[note="F"]')[0];
const Fsharp = document.querySelectorAll('[note="F#"]')[0];
const G = document.querySelectorAll('[note="G"]')[0];
const Gsharp = document.querySelectorAll('[note="G#"]')[0];
const A = document.querySelectorAll('[note="A"]')[0];
const Asharp = document.querySelectorAll('[note="A#"]')[0];
const B = document.querySelectorAll('[note="B"]')[0];
const C2 = document.querySelectorAll('[note="C2"]')[0];
const Csharp2 = document.querySelectorAll('[note="C#2"]')[0];
const D2 = document.querySelectorAll('[note="D2"]')[0];

document.addEventListener("keydown", logKey);
document.addEventListener("keyup", stopKey);

const pressedNotes = new Map();

function findKey(code) {
  switch (code) {
    case "KeyA":
      return "C";
    case "KeyW":
      return "C#";
    case "KeyS":
      return "D";
    case "KeyE":
      return "D#";
    case "KeyD":
      return "E";
    case "KeyF":
      return "F";
    case "KeyT":
      return "F#";
    case "KeyG":
      return "G";
    case "KeyY":
      return "G#";
    case "KeyH":
      return "A";
    case "KeyU":
      return "A#";
    case "KeyJ":
      return "B";
    case "KeyK":
      return "C2";
    case "KeyO":
      return "C#2";
    case "KeyL":
      return "D2";
    default:
      return;
  }
}

function getHz(note = "A", octave = 4) {
  octave--; // for testing
  octave--; // for testing

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
}

function logKey(e) {
  const key = findKey(e.code);

  if (!key || pressedNotes.get(key)) {
    return;
  }

  const osc = audioContext.createOscillator();
  const noteGainNode = audioContext.createGain();
  noteGainNode.connect(audioContext.destination);
  noteGainNode.gain.value = 0.0001;

  // attack
  noteGainNode.gain.exponentialRampToValueAtTime(
    0.1,
    audioContext.currentTime + 0.01
  );
  // decay
  noteGainNode.gain.exponentialRampToValueAtTime(
    0.001,
    audioContext.currentTime + 1
  );
  // release
  noteGainNode.gain.exponentialRampToValueAtTime(
    0.00001,
    audioContext.currentTime + 2
  );

  osc.connect(noteGainNode);
  osc.type = "triangle";

  let freq;

  switch (e.code) {
    case "KeyA":
      freq = getHz("C", 4);
      C.classList.add("pressed");
      break;
    case "KeyW":
      freq = getHz("C#", 4);
      Csharp.classList.add("pressed");
      break;
    case "KeyS":
      freq = getHz("D", 4);
      D.classList.add("pressed");
      break;
    case "KeyE":
      freq = getHz("D#", 4);
      Dsharp.classList.add("pressed");
      break;
    case "KeyD":
      freq = getHz("E", 4);
      E.classList.add("pressed");
      break;
    case "KeyF":
      freq = getHz("F", 4);
      F.classList.add("pressed");
      break;
    case "KeyT":
      freq = getHz("F#", 4);
      Fsharp.classList.add("pressed");
      break;
    case "KeyG":
      freq = getHz("G", 4);
      G.classList.add("pressed");
      break;
    case "KeyY":
      freq = getHz("G#", 4);
      Gsharp.classList.add("pressed");
      break;
    case "KeyH":
      freq = getHz("A", 5);
      A.classList.add("pressed");
      break;
    case "KeyU":
      freq = getHz("A#", 5);
      Asharp.classList.add("pressed");
      break;
    case "KeyJ":
      freq = getHz("B", 5);
      B.classList.add("pressed");
      break;
    case "KeyK":
      freq = getHz("C", 5);
      C2.classList.add("pressed");
      break;
    case "KeyO":
      freq = getHz("C#", 5);
      Csharp2.classList.add("pressed");
      break;
    case "KeyL":
      freq = getHz("D", 5);
      D2.classList.add("pressed");
      break;
    default:
      return;
  }

  if (Number.isFinite(freq)) {
    osc.frequency.value = freq;
  }
  pressedNotes.set(key, osc);
  pressedNotes.get(key).start();
}

function stopKey(e) {
  switch (e.code) {
    case "KeyA":
      C.classList.remove("pressed");
      break;
    case "KeyW":
      Csharp.classList.remove("pressed");
      break;
    case "KeyS":
      D.classList.remove("pressed");
      break;
    case "KeyE":
      Dsharp.classList.remove("pressed");
      break;
    case "KeyD":
      E.classList.remove("pressed");
      break;
    case "KeyF":
      F.classList.remove("pressed");
      break;
    case "KeyT":
      Fsharp.classList.remove("pressed");
      break;
    case "KeyG":
      G.classList.remove("pressed");
      break;
    case "KeyY":
      Gsharp.classList.remove("pressed");
      break;
    case "KeyH":
      A.classList.remove("pressed");
      break;
    case "KeyU":
      Asharp.classList.remove("pressed");
      break;
    case "KeyJ":
      B.classList.remove("pressed");
      break;
    case "KeyK":
      C2.classList.remove("pressed");
      break;
    case "KeyO":
      Csharp2.classList.remove("pressed");
      break;
    case "KeyL":
      D2.classList.remove("pressed");
      break;
  }

  const key = findKey(e.code);

  const osc = pressedNotes.get(key);
  if (osc) {
    setTimeout(() => {
      osc.stop();
    }, 2000);
    pressedNotes.delete(key);
  }
}
