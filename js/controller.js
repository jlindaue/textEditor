import {setSidebarItems} from "./sidebar.js"
import {showEditor} from "./view/editor.js"


const wrapper = document.querySelector(".wrapper");
let content = "<h1 id='ID'>Hello world</h1> This is my editor";
showEditor(wrapper, content);
setSidebarItems(["Item 1", "Item 2","Item 3", "Item 4"]);
