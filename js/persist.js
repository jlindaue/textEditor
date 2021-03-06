// functions responsible for saving and retrieving document from filesystem

import {updateTitles} from "./editor.js";


let documentDirectory = undefined;
let mainHTML = undefined;
let mediaCount = 0;

async function writeFile(fileHandle, contents) {
    // Create a FileSystemWritableFileStream to write to.
    const writable = await fileHandle.createWritable();
    // Write the contents of the file to the stream.
    await writable.write(contents);
    // Close the file and write the contents to disk.
    await writable.close();
}


export async function createNewDocument(){
    const html = document.querySelector('.paper').innerHTML;
    documentDirectory = await window.showDirectoryPicker();
    if (documentDirectory === undefined) return;
    mainHTML = await documentDirectory.getFileHandle('main.html', { create: true });
    await writeFile(mainHTML, html);
    mediaCount = 0;
}

export async function saveChanges(){
    const html = document.querySelector('.paper').innerHTML;
    if (documentDirectory === undefined) {
        await createNewDocument(html);
        return;
    }
    mainHTML = await documentDirectory.getFileHandle('main.html', { create: true });
    await writeFile(mainHTML, html);
}


export async function saveBlob(url, type, targetElement){
    mediaCount += 1;
    const blobFile = await documentDirectory.getFileHandle(`${mediaCount}.${type}`, { create: true });
    // Create a FileSystemWritableFileStream to write to.
    const writable = await blobFile.createWritable();
    // Make an HTTP request for the contents.
    const response = await fetch(url);
    // Stream the response into the file.
    await response.body.pipeTo(writable);
    // pipeTo() closes the destination pipe by default, no need to close it.
    targetElement.setAttribute("id", `${mediaCount}.${type}`)
    await saveChanges();
}

export async function deleteBlob(filename){
    await documentDirectory.removeEntry(filename);
    mediaCount -= 1;
}


export async function loadDocument(paper){
    const oldDoc = documentDirectory;
    documentDirectory = await window.showDirectoryPicker();
    if (documentDirectory === undefined) {
        documentDirectory = oldDoc;
        return;
    }

    mediaCount = 0
    const records = new Map()

    for await (const entry of documentDirectory.values()) {
        if (entry.name === "main.html"){
            const file = await entry.getFile();
            paper.innerHTML = await file.text();
            mainHTML = file;
        }else{
            mediaCount+=1;
            if (entry.name.endsWith(".mp3")){
                const file = await entry.getFile();
                const url = URL.createObjectURL(file);
                records.set(entry.name, url);
            }
        }
    }

    paper.querySelectorAll("audio").forEach((audio)=>{
        audio.src = records.get(audio.getAttribute("id"));
    })

    paper.querySelectorAll(".deleteMedia").forEach((closeButton)=>{
        closeButton.addEventListener("click", ()=>{
            const mediaWrapper = closeButton.parentNode;
            mediaWrapper.parentNode.removeChild(mediaWrapper);
        })
    })
    updateTitles();
}

//function wrapper - calls function and displays loading div
export async function wait(f, text, ...args){
    const wrapper  = document.querySelector(".wrapper")
    let waiting = document.createElement("div");
    waiting.className = "waiting";
    waiting.innerHTML = text + " <div></div>";
    wrapper.append(waiting)
    try{
        await f(...args);
    }catch (e){
        console.log(e);
    }
    wrapper.removeChild(waiting)
}

// if the user havent specified save location yet, show directory picker and warning
export async function saveWarning(){
    if (documentDirectory !== undefined){
        return false;
    }
    try{
        await createNewDocument();
    }catch (e){
        console.log(e);
    }
    if (documentDirectory !== undefined){
        return false;
    }

    const wrapper  = document.querySelector(".wrapper")
    let warning = document.createElement("div");
    warning.className = "warning";
    warning.innerHTML = "You need to save this document first (Ctrl+S) to be able to add media";
    wrapper.append(warning);
    setTimeout(()=>{
        wrapper.removeChild(warning);
    },3000)
    return true;
}

//user actions that trigger document save/retrieve
export function registerDocumentActions(paper){
    const createDocumentButton = document.getElementById('createDocument');
    createDocumentButton.addEventListener('click', async () => {
        paper.innerHTML = ""
        updateTitles();
        await wait(createNewDocument, "Creating and saving", paper.innerHTML);
        document.querySelector("#sidebarCheckbox").checked = false;
    });
    const loadDocumentButton = document.getElementById('loadDocument');
    loadDocumentButton.addEventListener('click', async () => {
        updateTitles();
        await wait(loadDocument, "Loading", paper);
        paper.lastChild.scrollIntoView(true);
        document.querySelector("#sidebarCheckbox").checked = false;
    });
    document.addEventListener("keydown", async (e)=>{
        //ctrl+s
        if (e.ctrlKey && e.code === "KeyS"){
            e.preventDefault();
            await wait(saveChanges, "Saving", paper.innerHTML);
        }

    })
}
