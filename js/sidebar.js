export function setSidebarItems(items){
    const sidebar = document.querySelector(".sidebar-items");
    sidebar.innerHTML = "";
    items.forEach((item)=> {
        const li = document.createElement("li");
        li.textContent = item;
        sidebar.append(li);
    })
    addChaptersItem()
}

function addChaptersItem(){
    const sidebar = document.querySelector(".sidebar-items");
    const li = document.createElement("li");
    li.className = "list";
    li.innerHTML = "Chapters<ul class='chapters'></ul>";
    sidebar.append(li);
}

