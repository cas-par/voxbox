let audioContext;
let source;
let effectNode;
let oscillator;
let currentEffect = 'pitch';
let activeNodes = []; // Array für alle aktiven Audio-Nodes

const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const delaySlider = document.getElementById('delaySlider');
const delayValue = document.getElementById('delayValue');

// Event Listeners
startButton.addEventListener('click', startAudio);
stopButton.addEventListener('click', stopAudio);
delaySlider.addEventListener('input', updateDelay);

// Effekt-Buttons Event Listener
document.querySelectorAll('.effect-button').forEach(button => {
    button.addEventListener('click', () => {
        currentEffect = button.dataset.effect;
        updateEffectControls();
        if (source) {
            reconnectEffect();
        }
    });
});

// Nach dem DOMContentLoaded Event die Steuerelemente aktualisieren
document.addEventListener('DOMContentLoaded', () => {
    // Markiere den Pitch-Button als aktiv
    document.querySelector('[data-effect="pitch"]').classList.add('active');
    // Zeige die Pitch-Steuerelemente an
    updateEffectControls();
});

function updateEffectControls() {
    const activeEffectContainer = document.querySelector('.active-effect-container');
    const effectNameDiv = activeEffectContainer.querySelector('.effect-name');
    const effectControlsDiv = activeEffectContainer.querySelector('.effect-controls');
    
    // Buttons aktualisieren
    document.querySelectorAll('.effect-button').forEach(button => {
        if (button.dataset.effect === currentEffect) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });

    // Effekt-Name und Steuerelemente aktualisieren
    const config = effectConfigs[currentEffect];
    effectNameDiv.textContent = config.name;
    effectControlsDiv.innerHTML = ''; // Bestehende Steuerelemente löschen

    // Slider generieren
    config.sliders.forEach(slider => {
        const sliderContainer = document.createElement('div');
        sliderContainer.className = 'slider-container';
        
        const label = document.createElement('label');
        label.htmlFor = slider.id;
        label.textContent = slider.label;
        
        const input = document.createElement('input');
        input.type = 'range';
        input.id = slider.id;
        input.min = slider.min;
        input.max = slider.max;
        input.step = slider.step;
        input.value = slider.default;
        
        const value = document.createElement('span');
        value.className = 'slider-value';
        value.textContent = slider.default + (slider.unit ? ' ' + slider.unit : '');
        
        input.addEventListener('input', () => {
            value.textContent = input.value + (slider.unit ? ' ' + slider.unit : '');
            if (effectNode) {
                reconnectEffect();
            }
        });
        
        sliderContainer.appendChild(label);
        sliderContainer.appendChild(input);
        sliderContainer.appendChild(value);
        effectControlsDiv.appendChild(sliderContainer);
    });
}

function updateDelay() {
    const delay = parseFloat(delaySlider.value);
    delayValue.textContent = delay.toFixed(1);
    
    // Wenn ein Effekt aktiv ist, Delay aktualisieren
    if (effectNode) {
        reconnectEffect();
    }
}

async function startAudio() {
    try {
        // AudioContext erstellen, falls noch nicht vorhanden
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        // Mikrofonzugriff anfordern
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Audio-Source erstellen
        source = audioContext.createMediaStreamSource(stream);
        
        // Effekt verbinden
        reconnectEffect();
        
        // UI aktualisieren
        startButton.disabled = true;
        stopButton.disabled = false;
        
    } catch (error) {
        console.error('Fehler beim Starten der Audioaufnahme:', error);
        alert('Fehler beim Zugriff auf das Mikrofon. Bitte überprüfen Sie die Mikrofonberechtigung.');
    }
}

function reconnectEffect() {
    if (source) {
        // Bestehende Verbindungen trennen
        if (effectNode) {
            effectNode.disconnect();
        }
        source.disconnect();
        
        // Effekt basierend auf currentEffect erstellen
        switch(currentEffect) {
            case 'normal':
                createNormalEffect();
                break;
            case 'pitch':
                createPitchEffect();
                break;
            case 'robot':
                createRobotEffect();
                break;
            case 'echo':
                createEchoEffect();
                break;
            case 'metallic':
                createMetallicEffect();
                break;
            case 'chipmunk':
                createChipmunkEffect();
                break;
            case 'deep':
                createDeepEffect();
                break;
            case 'demon':
                createDemonEffect();
                break;
            case 'flanger':
                createFlangerEffect();
                break;
            default:
                createNormalEffect();
        }
    }
}

function createNormalEffect() {
    effectNode = audioContext.createGain();
    const delayNode = audioContext.createDelay(7.1);
    delayNode.delayTime.value = parseFloat(delaySlider.value);
    
    // Nodes zum activeNodes Array hinzufügen
    activeNodes = [effectNode, delayNode];
    
    source.connect(effectNode);
    effectNode.connect(delayNode);
    delayNode.connect(audioContext.destination);
}

function createPitchEffect() {
    const pitchSlider = document.getElementById('pitchSlider');
    const pitch = parseFloat(pitchSlider?.value || effectConfigs.pitch.sliders[0].default);
    
    if (Math.abs(pitch - 1.0) < 0.01) {
        return createNormalEffect();
    }

    effectNode = audioContext.createScriptProcessor(2048, 1, 1);
    const delayNode = audioContext.createDelay(7.1);
    delayNode.delayTime.value = parseFloat(delaySlider.value);
    
    // Speichere Nodes
    activeNodes = [effectNode, delayNode];
    
    // STFT Parameter
    const fftSize = 2048;
    const hopLength = fftSize / 4;
    const hannWindow = new Float32Array(fftSize);
    
    // Hanning-Fenster erstellen
    for (let i = 0; i < fftSize; i++) {
        hannWindow[i] = 0.5 * (1 - Math.cos(2 * Math.PI * i / fftSize));
    }
    
    // Buffer für die Verarbeitung
    let inputBuffer = new Float32Array(fftSize * 2);
    let outputBuffer = new Float32Array(fftSize);
    
    effectNode.onaudioprocess = (audioProcessingEvent) => {
        const input = audioProcessingEvent.inputBuffer;
        const output = audioProcessingEvent.outputBuffer;
        
        for (let channel = 0; channel < output.numberOfChannels; channel++) {
            const inputData = input.getChannelData(channel);
            const outputData = output.getChannelData(channel);
            
            // Schiebe Daten im Buffer
            inputBuffer.set(inputBuffer.subarray(inputData.length));
            inputBuffer.set(inputData, inputBuffer.length - inputData.length);
            
            // Wende Fenster an und berechne Pitch-Shift
            for (let i = 0; i < inputData.length; i++) {
                const readPos = i * pitch;
                const readIndex = Math.floor(readPos);
                const alpha = readPos - readIndex;
                
                // Interpoliere zwischen benachbarten Frames
                let sum = 0;
                for (let j = -2; j <= 2; j++) {
                    const pos = readIndex + j;
                    if (pos >= 0 && pos < inputBuffer.length) {
                        // Sinc-Interpolation
                        const sincArg = Math.PI * (readPos - pos);
                        const windowedSinc = sincArg === 0 ? 1 : 
                            Math.sin(sincArg) / sincArg * hannWindow[i % fftSize];
                        sum += inputBuffer[pos] * windowedSinc;
                    }
                }
                
                // Normalisierung und Soft-Clipping
                sum *= 0.8;
                if (sum > 0.8) sum = 0.8 + Math.tanh(sum - 0.8);
                if (sum < -0.8) sum = -0.8 - Math.tanh(-sum - 0.8);
                
                outputData[i] = sum;
            }
        }
    };
    
    // Verbinde die Nodes
    source.connect(effectNode);
    effectNode.connect(delayNode);
    delayNode.connect(audioContext.destination);
}

function createChipmunkEffect() {
    effectNode = audioContext.createScriptProcessor(4096, 1, 1);
    const delayNode = audioContext.createDelay(7.1);
    delayNode.delayTime.value = parseFloat(delaySlider.value);
    
    effectNode.onaudioprocess = (audioProcessingEvent) => {
        const inputBuffer = audioProcessingEvent.inputBuffer;
        const outputBuffer = audioProcessingEvent.outputBuffer;
        
        for (let channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
            const inputData = inputBuffer.getChannelData(channel);
            const outputData = outputBuffer.getChannelData(channel);
            
            for (let i = 0; i < inputData.length; i++) {
                outputData[i] = inputData[Math.floor(i * 1.5) % inputData.length];
            }
        }
    };
    
    source.connect(effectNode);
    effectNode.connect(delayNode);
    delayNode.connect(audioContext.destination);
}

function createRobotEffect() {
    effectNode = audioContext.createScriptProcessor(2048, 1, 1);
    const delayNode = audioContext.createDelay(7.1);
    delayNode.delayTime.value = parseFloat(delaySlider.value);
    
    // Speichere Nodes
    activeNodes = [effectNode, delayNode];
    
    // Stutter-Parameter
    const modulationSlider = document.getElementById('modulationSlider');
    const stutterRate = Math.max(0.05, Math.min(0.2, modulationSlider?.value / 500 || 0.1));
    
    // Buffer für Stutter-Effekt
    const bufferSize = Math.floor(audioContext.sampleRate * stutterRate);
    let stutterBuffer = new Float32Array(bufferSize);
    let isRecording = true;
    let bufferPosition = 0;
    let repeatCount = 0;
    const repeatsBeforeNewCapture = 2;
    
    effectNode.onaudioprocess = (audioProcessingEvent) => {
        const inputBuffer = audioProcessingEvent.inputBuffer;
        const outputBuffer = audioProcessingEvent.outputBuffer;
        
        for (let channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
            const inputData = inputBuffer.getChannelData(channel);
            const outputData = outputBuffer.getChannelData(channel);
            
            for (let i = 0; i < inputData.length; i++) {
                if (isRecording) {
                    // Aufnahme in den Stutter-Buffer
                    stutterBuffer[bufferPosition] = inputData[i];
                    outputData[i] = inputData[i];
                    bufferPosition++;
                    
                    // Buffer voll - wechsle zu Wiedergabe
                    if (bufferPosition >= bufferSize) {
                        isRecording = false;
                        bufferPosition = 0;
                        repeatCount = 0;
                    }
                } else {
                    // Wiedergabe aus dem Stutter-Buffer
                    outputData[i] = stutterBuffer[bufferPosition];
                    bufferPosition++;
                    
                    // Buffer-Ende erreicht
                    if (bufferPosition >= bufferSize) {
                        bufferPosition = 0;
                        repeatCount++;
                        
                        // Nach einigen Wiederholungen neue Aufnahme starten
                        if (repeatCount >= repeatsBeforeNewCapture) {
                            isRecording = true;
                            bufferPosition = 0;
                        }
                    }
                }
            }
        }
    };
    
    // Verbinde die Nodes
    source.connect(effectNode);
    effectNode.connect(delayNode);
    delayNode.connect(audioContext.destination);
}

function createDeepEffect() {
    effectNode = audioContext.createScriptProcessor(4096, 1, 1);
    const delayNode = audioContext.createDelay(7.1);
    delayNode.delayTime.value = parseFloat(delaySlider.value);
    
    effectNode.onaudioprocess = (audioProcessingEvent) => {
        const inputBuffer = audioProcessingEvent.inputBuffer;
        const outputBuffer = audioProcessingEvent.outputBuffer;
        
        for (let channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
            const inputData = inputBuffer.getChannelData(channel);
            const outputData = outputBuffer.getChannelData(channel);
            
            for (let i = 0; i < inputData.length; i++) {
                outputData[i] = inputData[Math.floor(i * 0.5) % inputData.length];
            }
        }
    };
    
    source.connect(effectNode);
    effectNode.connect(delayNode);
    delayNode.connect(audioContext.destination);
}

function createEchoEffect() {
    effectNode = audioContext.createGain();
    const delayNode = audioContext.createDelay(7.1);
    const feedbackGain = audioContext.createGain();
    const mainGain = audioContext.createGain();
    
    // Speichere alle Nodes im activeNodes Array
    activeNodes = [effectNode, delayNode, feedbackGain, mainGain];
    
    // Hole den Feedback-Wert vom Slider
    const feedbackSlider = document.getElementById('feedbackSlider');
    const feedbackValue = parseFloat(feedbackSlider?.value || effectConfigs.echo.sliders[0].default);
    
    delayNode.delayTime.value = parseFloat(delaySlider.value);
    feedbackGain.gain.value = feedbackValue;
    mainGain.gain.value = 0.7;
    
    source.connect(effectNode);
    effectNode.connect(mainGain);
    mainGain.connect(audioContext.destination);
    
    effectNode.connect(delayNode);
    delayNode.connect(feedbackGain);
    feedbackGain.connect(delayNode);
    delayNode.connect(audioContext.destination);
}

function createMetallicEffect() {
    effectNode = audioContext.createScriptProcessor(2048, 1, 1);
    const delayNode = audioContext.createDelay(7.1);
    delayNode.delayTime.value = parseFloat(delaySlider.value);
    
    // Speichere Nodes
    activeNodes = [effectNode, delayNode];
    
    // Metallic-Parameter
    const pitchShift = 2.0;  // Oktave höher für metallischen Klang
    const ringModFreq = 80;  // Hz für zusätzlichen metallischen Charakter
    let phase = 0;
    
    effectNode.onaudioprocess = (audioProcessingEvent) => {
        const inputBuffer = audioProcessingEvent.inputBuffer;
        const outputBuffer = audioProcessingEvent.outputBuffer;
        
        for (let channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
            const inputData = inputBuffer.getChannelData(channel);
            const outputData = outputBuffer.getChannelData(channel);
            
            for (let i = 0; i < inputData.length; i++) {
                // Ring Modulation für metallischen Klang
                phase += ringModFreq / audioContext.sampleRate;
                const modulator = Math.sin(2 * Math.PI * phase);
                
                // Pitch-Shift und Modulation kombinieren
                const pitchIndex = Math.floor(i * pitchShift) % inputData.length;
                const pitchedSample = inputData[pitchIndex];
                
                // Kombiniere Original mit gepitchtem und moduliertem Signal
                outputData[i] = inputData[i] * 0.5 + pitchedSample * modulator * 0.5;
            }
        }
    };
    
    // Verbinde die Nodes
    source.connect(effectNode);
    effectNode.connect(delayNode);
    delayNode.connect(audioContext.destination);
}

function createDemonEffect() {
    effectNode = audioContext.createScriptProcessor(4096, 1, 1);
    const delayNode = audioContext.createDelay(7.1);
    delayNode.delayTime.value = parseFloat(delaySlider.value);
    
    // Buffer für glatte Übergänge
    let previousBuffer = new Float32Array(4096);
    
    effectNode.onaudioprocess = (audioProcessingEvent) => {
        const inputBuffer = audioProcessingEvent.inputBuffer;
        const outputBuffer = audioProcessingEvent.outputBuffer;
        
        for (let channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
            const inputData = inputBuffer.getChannelData(channel);
            const outputData = outputBuffer.getChannelData(channel);
            
            // Pitch nach unten (Dämon-Effekt)
            for (let i = 0; i < inputData.length; i++) {
                const readPos = i * 0.25; // Sehr tiefe Stimme
                const readIndex = Math.floor(readPos);
                const fraction = readPos - readIndex;
                
                // Interpolation für glattere Übergänge
                let currentSample, nextSample;
                if (readIndex >= inputData.length) {
                    currentSample = previousBuffer[readIndex - inputData.length];
                    nextSample = previousBuffer[readIndex - inputData.length + 1] || inputData[0];
                } else {
                    currentSample = inputData[readIndex];
                    nextSample = readIndex + 1 < inputData.length ? inputData[readIndex + 1] : previousBuffer[0];
                }
                
                // Lineare Interpolation für glatte Übergänge
                outputData[i] = currentSample + fraction * (nextSample - currentSample);
            }
            
            // Aktualisiere Previous Buffer
            previousBuffer.set(inputData);
        }
    };
    
    source.connect(effectNode);
    effectNode.connect(delayNode);
    delayNode.connect(audioContext.destination);
}

function createFlangerEffect() {
    effectNode = audioContext.createScriptProcessor(4096, 1, 1);
    const delayNode = audioContext.createDelay(7.1);
    delayNode.delayTime.value = parseFloat(delaySlider.value);
    
    let phase = 0;
    
    effectNode.onaudioprocess = (audioProcessingEvent) => {
        const inputBuffer = audioProcessingEvent.inputBuffer;
        const outputBuffer = audioProcessingEvent.outputBuffer;
        
        for (let channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
            const inputData = inputBuffer.getChannelData(channel);
            const outputData = outputBuffer.getChannelData(channel);
            
            for (let i = 0; i < inputData.length; i++) {
                phase += 0.002;
                const delay = Math.sin(phase) * 0.002;
                const delayedIndex = Math.floor(i - (delay * audioContext.sampleRate));
                
                if (delayedIndex >= 0 && delayedIndex < inputData.length) {
                    outputData[i] = (inputData[i] + inputData[delayedIndex]) * 0.7;
                } else {
                    outputData[i] = inputData[i];
                }
            }
        }
    };
    
    source.connect(effectNode);
    effectNode.connect(delayNode);
    delayNode.connect(audioContext.destination);
}

function stopAudio() {
    if (source) {
        // Sofort alle Audio-Verbindungen trennen
        source.disconnect();
        
        // Sofort alle aktiven Nodes trennen und stoppen
        activeNodes.forEach(node => {
            if (node) {
                if (node.stop) {  // Falls es ein Oscillator ist
                    node.stop();
                }
                node.disconnect();
            }
        });
        
        // AudioContext suspendieren für sofortiges Audio-Stop
        if (audioContext) {
            audioContext.suspend();
        }
        
        // Leere das Array
        activeNodes = [];
        
        // Setze die Referenzen zurück
        source = null;
        effectNode = null;
        oscillator = null;
    }
    
    startButton.disabled = false;
    stopButton.disabled = true;
}