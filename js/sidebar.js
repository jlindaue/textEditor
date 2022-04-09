export function setSidebarItems(items){
    const sidebar = document.querySelector(".sidebar-items");
    sidebar.innerHTML = "";
    items.forEach((item)=> {
        const li = document.createElement("li");
        li.textContent = item;
        sidebar.append(li);
    })
}

