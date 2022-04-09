let displayMediaOptions = {
    video: {
        cursor: "always"
    },
    audio: true
};
let mediaRecorder;
let chunks = [];

let video = document.querySelector("video")


function createRecorder(videoStream){
    mediaRecorder = new MediaRecorder(videoStream);
    mediaRecorder.ondataavailable = function(e) {
        chunks.push(e.data);
    };
    mediaRecorder.onstop = function(e) {
        const blob = new Blob(chunks, { 'type' : 'video/mp4' });
        chunks = [];
        const videoURL = URL.createObjectURL(blob);
        video.src = videoURL;

        const downloadLink = document.createElement('a');
        downloadLink.href = videoURL;
        downloadLink.innerText = "Download recording";
        downloadLink.download = `recording.mp4`;
        document.body.appendChild(downloadLink);
    };
    mediaRecorder.ondataavailable = function(e) {
        chunks.push(e.data);
    };
    mediaRecorder.start();
}

function startCapture(displayMediaOptions) {
    navigator.mediaDevices.getDisplayMedia(displayMediaOptions)
        .then(videoStream => {
            console.log("videook");
            navigator.mediaDevices.getUserMedia({audio:true})
                .then(audioStream => {
                    console.log("audiook");
                    videoStream.addTrack(audioStream.getAudioTracks()[0])
                    createRecorder(videoStream);
                })
                .catch(e=>console.log(e));
        })
        .catch(err => { console.error("Error:" + err); return null; });
}

function stopCapture() {
    mediaRecorder.stop();
}



const startElem = document.getElementById("start");
const stopElem = document.getElementById("stop");
startElem.addEventListener("click", function(evt) {
    startCapture(displayMediaOptions);
}, false);
stopElem.addEventListener("click", function(evt) {
    stopCapture();
}, false);