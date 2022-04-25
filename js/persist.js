import {updateTitles} from "./view/editor.js";

let documentDirectory = undefined;
let mainHTML = undefined;
let mediaCount = 0;
//let blobs = new Map();

async function writeFile(fileHandle, contents) {
    // Create a FileSystemWritableFileStream to write to.
    const writable = await fileHandle.createWritable();
    // Write the contents of the file to the stream.
    await writable.write(contents);
    // Close the file and write the contents to disk.
    await writable.close();
}


export async function createNewDocument(html){
    documentDirectory = await window.showDirectoryPicker();
    mainHTML = await documentDirectory.getFileHandle('main.html', { create: true });
    //blobs = new Map();
    await writeFile(mainHTML, html);
    mediaCount = 0;
}

export async function saveChanges(html){
    await writeFile(mainHTML, html);
}


export async function saveBlob(url, type){
    mediaCount += 1;
    const blobFile = await documentDirectory.getFileHandle(`${mediaCount}.${type}`, { create: true });
    // Create a FileSystemWritableFileStream to write to.
    const writable = await blobFile.createWritable();
    // Make an HTTP request for the contents.
    const response = await fetch(url);
    // Stream the response into the file.
    await response.body.pipeTo(writable);
    // pipeTo() closes the destination pipe by default, no need to close it.
    //blobs.set(filename, blobFile);
    return `${mediaCount}.${type}`;
}

export async function deleteBlob(filename){
    await documentDirectory.removeEntry(filename);
    mediaCount -= 1;
}

export async function loadDocument(paper){
    documentDirectory = await window.showDirectoryPicker();

    for await (const entry of documentDirectory.values()) {
        console.log(entry.kind, entry.name);
        const file = await entry.getFile();

        if (entry.name === "main.html"){
            paper.innerHTML = await file.text();
            mainHTML = file;
        }else{
            URL.createObjectURL(file);
        }
        console.log(file);
    }
    mediaCount = documentDirectory.values().size - 1;
}


export async function wait(f, ...args){
    const wrapper  = document.querySelector(".wrapper")
    let waiting = document.createElement("div");
    waiting.className = "waiting";
    waiting.innerHTML = "Saving <div></div>";
    wrapper.append(waiting)
    await f(...args);
    wrapper.removeChild(waiting)

}


export function registerDocumentActions(paper){
    const createDocumentButton = document.getElementById('createDocument');
    createDocumentButton.addEventListener('click', async () => {
        paper.innerHTML = `<h1>Title</h1>`
        updateTitles();
        await createNewDocument(paper.innerHTML);
    });
    const loadDocumentButton = document.getElementById('loadDocument');
    loadDocumentButton.addEventListener('click', async () => {
        updateTitles();
        await loadDocument(paper);
    });
    document.addEventListener("keydown", async (e)=>{
        //ctrl+s
        console.log(e);
        await wait(saveChanges, paper.innerHTML);
    })
}
