console.log("Loading effect configs...");
const effectConfigs = {
    normal: {
        name: "Normal",
        sliders: []
    },
    pitch: {
        name: "Tonhöhe ändern",
        sliders: [{
            id: "pitchSlider",
            label: "Tonhöhe anpassen",
            min: 0.25,
            max: 4,
            step: 0.05,
            default: 1,
            unit: ""
        }]
    },
    robot: {
        name: "Roboter",
        sliders: [{
            id: "modulationSlider",
            label: "Modulation",
            min: 1,
            max: 100,
            step: 1,
            default: 30,
            unit: "Hz"
        }]
    },
    echo: {
        name: "Echo",
        sliders: [{
            id: "feedbackSlider",
            label: "Intensität",
            min: 0,
            max: 1,
            step: 0.1,
            default: 0.5,
            unit: ""
        }]
    },
    metallic: {
        name: "Metallic",
        sliders: [{
            id: "metallicSlider",
            label: "Metallischer Effekt",
            min: 0,
            max: 1,
            step: 0.1,
            default: 0.5,
            unit: ""
        }]
    },
    water: {
        name: "Gurgeln",
        sliders: [{
            id: "waterSlider",
            label: "Wasser-Effekt",
            min: 0.1,
            max: 2,
            step: 0.1,
            default: 1,
            unit: ""
        }]
    },
    overdrive: {
        name: "Overdrive",
        sliders: [{
            id: "driveSlider",
            label: "Verzerrung",
            min: 1,
            max: 10,
            step: 0.5,
            default: 5,
            unit: ""
        }]
    },
    chipmunk: {
        name: "Quietschig",
        sliders: [{
            id: "chipmunkSlider",
            label: "Höhe",
            min: 1,
            max: 3,
            step: 0.1,
            default: 1.5,
            unit: ""
        }]
    },
    deep: {
        name: "Sehr Tief",
        sliders: [{
            id: "deepSlider",
            label: "Tiefe",
            min: 0.2,
            max: 0.8,
            step: 0.05,
            default: 0.5,
            unit: ""
        }]
    },
    demon: {
        name: "Dämon",
        sliders: [
            {
                id: "demonPitchSlider",
                label: "Tiefe",
                min: 0.25,
                max: 0.75,
                step: 0.01,
                default: 0.5
            }
        ]
    },
    reverse: {
        name: "Rückwärts",
        sliders: []
    },
    flanger: {
        name: "Flanger",
        sliders: [{
            id: "flangerSpeedSlider",
            label: "Geschwindigkeit",
            min: 0.001,
            max: 0.01,
            step: 0.001,
            default: 0.002,
            unit: ""
        }]
    }
};
console.log("Effect configs loaded:", Object.keys(effectConfigs)); 