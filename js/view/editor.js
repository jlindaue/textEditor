function getCurrentNode(){
    const paper = document.querySelector(".paper");
    paper.focus();
    let currentNode = document.getSelection().anchorNode.parentNode
    if (currentNode === paper){
        currentNode = document.getSelection().anchorNode;
    }
    return currentNode;
}

function insertElement(newNode){
    const currentNode = getCurrentNode();
    console.log(currentNode)
    currentNode.parentNode.insertBefore(newNode, currentNode.nextSibling);
}

function addPicture(){
    const picture = document.createElement("img");
    picture.src = "https://d32-a.sdn.cz/d_32/c_static_QR_Q/rZ59K/media/img/logo_v2.svg";
    insertElement(picture);
}

function addTitle(level){
    const title = document.createElement(`h${level}`);
    title.innerText = "Hello";
    insertElement(title);
    title.focus();
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
        title: "Create Link",
        action: "createLink",
        icon: "add-link"
    },
    {
        title: "Delete link",
        action: "unlink",
        icon: "delete-link"
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
    }
];


let lastFocused = undefined;

function executeAction(){
    let action = this.getAttribute("action");
    console.log(action);
    document.execCommand(action, false);
    const paper = document.querySelector(".paper");
    paper.focus();
    console.log(lastFocused)
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

export function showEditor(where, content){
    const editor = document.createElement("div");
    editor.className = "editor";

    const tools = document.createElement("div");
    showTools(tools);
    tools.className = "tools";

    const paper = document.createElement("div");
    paper.innerHTML = content;
    paper.setAttribute("contenteditable", "true")
    paper.className = "paper";

    //track last visited child
    paper.childNodes.forEach((child)=>{
        child.addEventListener("focus", ()=>{lastFocused=child;})
    });


    editor.append(tools,paper);
    where.append(editor);
}