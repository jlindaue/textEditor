

class AudioEditor{
    constructor(resultDestination, parent) {
        this.parent = parent;
        this.resultDestination = resultDestination;
        this.audio = document.createElement("audio");
        this.audio.className = "audio";
        this.audio.controls = "controls";
        this.audioInput = this.createAudioInput();
        this.recording = false;

        this.createRecordingInterface();
        this.doneButton = this.createDoneButton();



        this.chunks = [];

        const div = document.createElement("div")
        div.className = "audioInputs";
        div.append(this.audioInput, this.recordButton)
        this.parent.append(div, this.audio, this.createDoneButton());

    }

    createDoneButton(){
        const doneButton = document.createElement("input")
        doneButton.type = "button";
        doneButton.className = "doneButton"
        doneButton.classList.add("greenButton")
        doneButton.value = "Use this audio"
        doneButton.addEventListener("click", ()=>{
            //finalize and close
            this.parent.parentNode.parentNode.removeChild(this.parent.parentNode);
            this.resultDestination.src = this.audio.src;
        })
        return doneButton;
    }


    showAudio(file){
        if (file === undefined) return;
        let url = URL.createObjectURL(file);
        this.audio.src = url;
    }

    createAudioInput(){
        let input = document.createElement("input");
        input.type = "file";
        input.classList.add("fileInput")
        input.onchange = (e)=>{
            let file = input.files[0];
            this.showAudio(file);
        }
        this.audio.addEventListener("drop", (e)=>{
            e.preventDefault();
            let file = e.dataTransfer.files[0];
            this.showAudio(file);
        })
        return input;
    }

    startRecording(){
        this.recording = true;
        this.chunks = [];
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                this.mediaRecorder = new MediaRecorder(stream);
                this.mediaRecorder.ondataavailable = (e)=>{
                    this.chunks.push(e.data);
                }
                this.mediaRecorder.onstop = ()=>{
                    const blob = new Blob(this.chunks, { 'type' : 'audio/mp3' });
                    this.audio.src = URL.createObjectURL(blob);
                }
                this.mediaRecorder.start();
            });
    }

    stopRecording(){
        this.recording = false;
        this.mediaRecorder.stop();
    }

    createRecordingInterface(){
        this.recordButton = document.createElement("div");

        let p = document.createElement("p");
        p.innerText = "Start recording"
        let dot = document.createElement("div");
        this.recordButton.append(p,dot );

        this.recordButton.className = "record"
        this.recordButton.onclick = ()=>{
            if (this.recording){
                this.stopRecording();
                p.innerText = "Start recording";
                this.recordButton.classList.remove("recording")
            }else{
                this.startRecording();
                p.innerText = "Stop recording";
                this.recordButton.classList.add("recording")
            }
        }
    }


}



export function showAudioPopup(resultDestination){
    const popupWrapper = document.createElement("div");
    popupWrapper.className = "popupWrapper";
    const popup = document.createElement("div");
    popup.className = "popup";

    const closeButton = document.createElement("div");
    closeButton.innerHTML = `<div></div><div></div>`
    closeButton.className = "closeButton";
    closeButton.addEventListener("click", ()=>{
        document.body.removeChild(popupWrapper);
    })

    popup.innerHTML = `<h1>Upload your audio or record it here</h1>`

    let audio = new AudioEditor(resultDestination, popup);

    popup.append(closeButton);
    popupWrapper.append(popup);
    document.body.append(popupWrapper)
}
