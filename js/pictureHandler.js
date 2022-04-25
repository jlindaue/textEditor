import {saveBlob, wait} from "./persist.js";

const CANVAS_WIDTH = "600";
const CANVAS_HEIGHT = "400";

class ImageEditor{
    constructor(resultDestination){
        this.resultDestination = resultDestination;
        this.canvas = document.createElement("canvas");
        this.canvas.className = "canvas";
        this.canvas.setAttribute("width", `${CANVAS_WIDTH}px`);
        this.canvas.setAttribute("height", `${CANVAS_HEIGHT}px`);

        this.action = "makeLine"

        this.cx = this.canvas.getContext("2d");

        this.cx.lineCap = "round";

        this.mousePosition = [-1,-1];
        this.createControls();

        this.imageInput = this.imageInput();

        this.canvas.addEventListener("mousemove", this);
        //this.controls.addEventListener("mousemove", this);

    }

    createControls(){
        this.controls = document.createElement("div");
        this.controls.className = "canvasControls";

        const colors = document.createElement("input");
        colors.type = "color";
        colors.className = "colors"
        colors.addEventListener("change", ()=>{
            this.cx.fillStyle = colors.value;
            this.cx.strokeStyle = colors.value;
            this.mousePosition = [-1,-1];
        });
        //this.controls.innerHTML += `<label>Choose a color: </label>`
        this.controls.append(colors)

        const lineWidth = document.createElement("select");
        lineWidth.className = "lineWidth";
        [1, 2, 3, 5, 10, 20, 50].forEach((size) =>{
            lineWidth.innerHTML += `<option value="${size}">${size} px</option>`;
        });
        lineWidth.addEventListener("change", ()=>{
            this.cx.lineWidth = lineWidth.value;
        });
        //this.controls.innerHTML += `<label>Set line width: </label>`
        this.controls.append(lineWidth)


        const doneButton = document.createElement("input")
        doneButton.type = "button";
        doneButton.className = "doneButton"
        doneButton.classList.add("greenButton")
        doneButton.value = "Use this picture"
        doneButton.addEventListener("click", async()=>{
            //finalize and close
            document.body.removeChild(this.cx.canvas.parentNode.parentNode);
            this.resultDestination.src = this.cx.canvas.toDataURL();
            await wait(saveBlob, "Saving", this.cx.canvas.toDataURL(), "png", this.resultDestination);
        })

        this.controls.append(doneButton)

    }

    drawImage(file){
        if (file === undefined) return;
        let url = URL.createObjectURL(file);
        console.log(url)
        const image = new Image();
        image.src = url;
        image.addEventListener("load", ()=>{
            const color = this.cx.fillStyle;
            const lineWidth = this.cx.lineWidth;
            if (image.height < CANVAS_HEIGHT && image.width < CANVAS_WIDTH){
                this.cx.canvas.width = image.width;
                this.cx.canvas.height = image.height;
                this.cx.drawImage(image, 0, 0)
            }else{
                const ratio = Math.max(image.height/CANVAS_HEIGHT, image.width/CANVAS_WIDTH);
                this.cx.canvas.width = Math.round(image.width/ratio)
                this.cx.canvas.height = Math.round(image.height/ratio)
                this.cx.drawImage(image, 0, 0, this.cx.canvas.width, this.cx.canvas.height);
            }
            this.cx.lineCap = "round";
            this.cx.fillStyle = color;
            this.cx.strokeStyle = color;
            this.cx.lineWidth = lineWidth;
        });
    }

    imageInput(){
        let input = document.createElement("input");
        input.type = "file";
        input.classList.add("fileInput")
        input.onchange = (e)=>{
            let file = input.files[0];
            this.drawImage(file);
        }

        this.canvas.addEventListener("drop", (e)=>{
            e.preventDefault();
            let file = e.dataTransfer.files[0];
            this.drawImage(file);
        })

        return input;
    }


    handleEvent(e){
        if (e.type == "mousemove"){
            this.makeLine(e);
            this.mousePosition = [e.offsetX, e.offsetY];
        }
        /*
        switch (e.type){
            case "mousedown": this._makeLine(e);break;
            case "mousemove": this._logPosition(e);break;
            case "click": this._showConfirm(e);break;
        }*/
    }


    makeLine(e){
        if (e.buttons % 2 !== 1 || this.mousePosition[0] === -1){
            return;
        }
        //console.log(this.mousePosition)
        this.cx.beginPath();
        this.cx.moveTo(...this.mousePosition);
        this.cx.lineTo(e.offsetX, e.offsetY);
        this.cx.stroke();
    }
}

export function showCanvasEditor(resultDestination){
    const popupWrapper = document.createElement("div");
    popupWrapper.className = "popupWrapper";
    const popup = document.createElement("div");
    popup.className = "popup";

    const closeButton = document.createElement("div");
    closeButton.innerHTML = `<div></div><div></div>`
    closeButton.className = "closeButton";
    closeButton.addEventListener("click", ()=>{
        document.body.removeChild(popupWrapper);
        resultDestination.parentNode.parentNode.removeChild(resultDestination.parentNode);
    })

    popup.innerHTML = `<h1>Upload your picture or create it here</h1>`

    let image = new ImageEditor(resultDestination);


    popup.append(image.imageInput, image.canvas, image.controls, closeButton);
    popupWrapper.append(popup);
    document.body.append(popupWrapper)
}