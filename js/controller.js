import {setSidebarItems} from "./sidebar.js"
import {showEditor} from "./view/editor.js"


const wrapper = document.querySelector(".wrapper");
let content = "<h1 id='ID'>Hello world</h1> This is my editor";

setSidebarItems([["Create new document", "createDocument"], ["Load document", "loadDocument"]]);
showEditor(wrapper, content);

