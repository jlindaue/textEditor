import {showCanvasEditor} from "../pictureHandler.js"
import {showAudioPopup} from "../recordHandler.js"
import {registerDocumentActions, saveChanges, saveWarning} from "../persist.js"


//determine current cursor position - where to insert element into paper
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

//insert element into paper
function insertElement(newNode){
    const currentNode = getCurrentNode();
    console.log(currentNode)
    currentNode.parentNode.insertBefore(newNode, currentNode.nextSibling);
}

//update numbering of h1 titles and at them to sidebar
export function updateTitles(){
    const sidebarChapters = document.querySelector(".sidebar .chapters")
    sidebarChapters.innerHTML = "";
    document.querySelectorAll(".paper h1").forEach((h, i)=>{
        h.id = `${i+1}.`;
        const titleLi = document.createElement("li");
        titleLi.innerText = h.id + " " + h.innerText;
        titleLi.addEventListener("click", ()=>{
            document.querySelector("#sidebarCheckbox").checked = false;
            document.querySelector(".paper").focus();
            const wasEditable = h.parentNode.getAttribute("contenteditable");
            h.parentNode.setAttribute("contenteditable", "false");
            h.focus();
            h.scrollIntoView(true);
            h.parentNode.setAttribute("contenteditable", wasEditable);
        })
        sidebarChapters.append(titleLi);
    })
}

//each media is wrapped - delete button is added to it
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



async function addPicture(){
    if (await saveWarning() === true) return;
    const picture = document.createElement("img");
    picture.alt = "Loading image";
    showCanvasEditor(picture);
    insertElement(createMediaWrapper(picture));
}

function addTitle(level){
    const title = document.createElement(`h${level}`);
    title.innerText = `Title ${level}`;
    insertElement(title);
    title.focus();
    updateTitles();
}

async function addAudio(){
    if (await saveWarning() === true) return;
    const audio = document.createElement("audio");
    audio.controls = "controls";
    showAudioPopup(audio);
    insertElement(createMediaWrapper(audio));
    audio.focus();
}

//document actions displayed in tool section
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
        action: "addPicture",
        callback: addPicture,
        icon: "picture--v1"
    },
    {
        title: "Add level 1 title",
        action: "title1",
        callback: ()=>addTitle(1),
        icon: "header-1"
    },
    {
        title: "Add level 2 title",
        action: "title2",
        callback: ()=>addTitle(2),
        icon: "header-2"
    },
    {
        title: "Add level 3 title",
        action: "title3",
        callback: ()=>addTitle(3),
        icon: "header-3"
    },
    {
        title: "Add audio",
        action: "addAudio",
        callback: addAudio,
        icon: "audio"
    }
];


//action executed natively
function executeAction(){
    let action = this.getAttribute("id");
    document.execCommand(action, false);
    const paper = document.querySelector(".paper");
    paper.focus();
}

// create document tools bar above it
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
        tool.setAttribute("id", func.action);

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

//switch beteen view and contenteditable mode of the document
function createEditableSwitch(paper, tools){
    const editable = document.createElement("div");
    editable.className = "editable"
    const toggle = document.createElement("input");
    toggle.type = "checkbox"
    toggle.id = "custom-checkbox-input"
    toggle.setAttribute("checked", "checked");
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

//main function - initialize editor
export function showEditor(where) {
    const editor = document.createElement("div");
    editor.className = "editor";


    const tools = document.createElement("section");
    showTools(tools);
    tools.className = "tools";

    const paper = document.createElement("article");

    paper.setAttribute("contenteditable", "true")
    paper.className = "paper";

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

