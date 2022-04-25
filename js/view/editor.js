import {showCanvasEditor} from "../pictureHandler.js"
import {showAudioPopup} from "../recordHandler.js"
import {registerDocumentActions, saveChanges} from "../persist.js"

function getCurrentNode(){
    const paper = document.querySelector(".paper");
    paper.focus();
    let currentNode = document.getSelection().anchorNode.parentNode
    if (currentNode === paper){
        currentNode = document.getSelection().anchorNode;
    }
    if (currentNode.className === "editor"){
        const p = document.createElement("p")
        paper.append(p);
        return p;
    }
    console.log(currentNode)
    console.log(document.getSelection())
    return currentNode;
}

function insertElement(newNode){
    const currentNode = getCurrentNode();
    console.log(currentNode)
    currentNode.parentNode.insertBefore(newNode, currentNode.nextSibling);
}


export function updateTitles(){
    const sidebarChapters = document.querySelector(".sidebar .chapters")
    sidebarChapters.innerHTML = "";
    document.querySelectorAll(".paper h1").forEach((h, i)=>{
        h.id = `${i+1}. `;
        const titleLi = document.createElement("li");
        titleLi.innerText = h.id + h.innerText;
        titleLi.addEventListener("click", ()=>{
            document.querySelector("#sidebarCheckbox").checked = false;
            document.querySelector(".paper").focus();
            h.parentNode.setAttribute("contenteditable", "false");
            h.focus();
            h.scrollIntoView(true);
            h.parentNode.setAttribute("contenteditable", "true");
        })
        sidebarChapters.append(titleLi);
    })
}


function createMediaWrapper(media) {
    const mediaWrapper = document.createElement("div");
    mediaWrapper.className = "mediaWrapper";

    const closeButton = document.createElement("div");
    closeButton.innerHTML = `<div></div><div></div>`
    closeButton.classList.add("closeButton")
    closeButton.classList.add("deleteMedia")
    closeButton.addEventListener("click", ()=>{
        mediaWrapper.parentNode.removeChild(mediaWrapper);
    })

    mediaWrapper.append(closeButton,media)
    return mediaWrapper;
}

function addPicture(){
    //TODO popup/dragndrop/create with canvas
    //TODO onclick option to delete
    const picture = document.createElement("img");
    showCanvasEditor(picture);
    //picture.src = "https://d32-a.sdn.cz/d_32/c_static_QR_Q/rZ59K/media/img/logo_v2.svg";
    insertElement(createMediaWrapper(picture));
}



function addTitle(level){
    const title = document.createElement(`h${level}`);
    title.innerText = `Title ${level}`;
    insertElement(title);
    title.focus();
    updateTitles();
}

function addAudio(){


    //TODO popup/dragndrop/record
    //TODO onclick option to delete
    const audio = document.createElement("audio");
    audio.controls = "controls";
    showAudioPopup(audio);
    //audio.src = "http://www.woo55.pk/adata/13921/01%20Maps%20-%20(www.SongsLover.pk).mp3";
    insertElement(createMediaWrapper(audio));
    audio.focus();
}




const functions = [
    {
        title: "Bold",
        action: "bold",
        icon: "bold"
    },
    {
        title: "Italic",
        action: "italic",
        icon: "italic"
    },
    {
        title: "Underline",
        action: "underline",
        icon: "underline"
    },
    {
        title: "Strike through",
        action: "strikeThrough",
        icon: "strikethrough"
    },
    {
        title: "Justify Left",
        action: "justifyLeft",
        icon: "align-left"
    },
    {
        title: "Justify Center",
        action: "justifyCenter",
        icon: "align-center"
    },
    {
        title: "Justify right",
        action: "justifyRight",
        icon: "align-right"
    },
    {
        title: "Format Block",
        action: "formatBlock",
        icon: "align-justify"
    },
    {
        title: "Insert Ordered List",
        action: "insertOrderedList",
        icon: "numbered-list"
    },
    {
        title: "Insert Unordered List",
        action: "insertUnorderedList",
        icon: "bulleted-list"
    },
    {
        title: "Italic",
        action: "italic",
        icon: "italic"
    },
    {
        title: "Outdent",
        action: "outdent",
        icon: "outdent"
    },
    {
        title: "Indent",
        action: "indent",
        icon: "indent"
    },
    {
        title: "Insert Horizontal Rule",
        action: "insertHorizontalRule",
        icon: "horizontal-line"
    },
    {
        title: "Undo",
        action: "undo",
        icon: "undo--v1"
    },
    {
        title: "Remove Format",
        action: "removeFormat",
        icon: "remove-format"
    },
    {
        title: "Add picture",
        callback: addPicture,
        icon: "picture--v1"
    },
    {
        title: "Add level 1 title",
        callback: ()=>addTitle(1),
        icon: "header-1"
    },
    {
        title: "Add level 2 title",
        callback: ()=>addTitle(2),
        icon: "header-2"
    },
    {
        title: "Add level 3 title",
        callback: ()=>addTitle(3),
        icon: "header-3"
    },
    {
        title: "Add audio",
        callback: addAudio,
        icon: "audio"
    }
];



function executeAction(){
    let action = this.getAttribute("action");
    document.execCommand(action, false);
    const paper = document.querySelector(".paper");
    paper.focus();
    console.log(document.getSelection().anchorNode.parentNode)
}


function showTools(toolsBox){
    functions.forEach((func)=>{
        const tool = document.createElement("div");
        tool.className = "tool";

        //add callback
        if (func.callback !== undefined){
            tool.addEventListener("click", func.callback);
        }else{
            tool.addEventListener("click", executeAction);
        }
        tool.title = func.title;
        tool.setAttribute("action", func.action);

        //add icon
        const icon = document.createElement("img");
        if (func.icon !== undefined){
            icon.src = `https://img.icons8.com/fluency-systems-filled/48/000000/${func.icon}.png`;
        }else if (func.iconLink !== undefined) {
            icon.src = func.iconLink;
        }
        icon.alt = func.action;
        tool.append(icon);

        toolsBox.append(tool);
    });
}

function pasteEvent(e) {
    e.preventDefault();

    let text = (e.originalEvent || e).clipboardData.getData('text/plain');
    document.execCommand('insertHTML', false, text);
}

function createEditableSwitch(paper, tools){
    const editable = document.createElement("div");
    editable.className = "editable"
    const toggle = document.createElement("input");
    toggle.type = "checkbox"
    toggle.id = "custom-checkbox-input"
    toggle.setAttribute("checked", true);
    //toggle.removeAttribute("checked")
    const toggleLabel = document.createElement("label");
    toggleLabel.setAttribute("for", "custom-checkbox-input");
    toggleLabel.id = "custom-checkbox";
    const editableText = document.createElement("div");
    editableText.innerText = "Allow editing"
    editable.append(editableText, toggle, toggleLabel)
    toggle.addEventListener("change", (e)=>{
        if (toggle.checked === true){
            tools.style.display = "flex";
            paper.setAttribute("contenteditable", "true")
        }else{
            tools.style.display = "none";
            paper.setAttribute("contenteditable", "false")
        }
    })
    return editable;
}

export function showEditor(where, content) {
    const editor = document.createElement("div");
    editor.className = "editor";


    const tools = document.createElement("div");
    showTools(tools);
    tools.className = "tools";

    const paper = document.createElement("div");
    //paper.innerHTML = content;

    paper.setAttribute("contenteditable", "true")
    paper.className = "paper";

    paper.addEventListener("keydown", (e) => {
        if (e.code === "Enter") {
            if (window.getSelection().anchorNode.parentNode.tagName === 'LI') return;
            //TODO
            document.execCommand('formatBlock', false, 'p');
        }
    })

    paper.addEventListener("paste", (e) => {
        e.preventDefault();
        let text = e.clipboardData.getData('text/plain');
        document.execCommand('insertHTML', false, text);
    })

    editor.append(tools, paper);
    where.append(editor);

    where.append(createEditableSwitch(paper, tools));

    updateTitles();
    registerDocumentActions(paper);
}

