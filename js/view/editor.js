

const functions = [
    {
        title: "Bold",
        action: "bold",
        icon: "https://img.icons8.com/fluency-systems-filled/48/000000/bold.png",
        callback: (e)=>{

        }
    },


];


function executeAction(){
    let action = this.dataset.action;
    document.execCommand(action, false);
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

        //add icon
        const icon = document.createElement("img");
        if (func.icon !== undefined){
            icon.src = `https://img.icons8.com/fluency-systems-filled/48/000000/${func.action}.png`;
        }else{
            icon.src = func.icon;
        }
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


    editor.append(tools,paper);
    where.append(editor);
}