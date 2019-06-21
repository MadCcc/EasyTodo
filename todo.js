"use strict";

(function () {
    function $(id) {
        return document.getElementById(id);
    }

    var activeItem = 0;
    var allItem = 0;
    var data;

    window.onload = function () {
        let add = $("add");
        let showAll = $("show-all");
        let showActive = $("show-active");
        let showCompleted = $("show-completed");
        let clear = $("clear");
        add.addEventListener("touchend", addTodoItem);
        add.addEventListener("touchstart", function(){
            add.style.backgroundColor = "rgba(100, 149, 237, 0.52)";
        });
        showAll.addEventListener("touchend", function(){
            changeFilter("ALL");
        });
        showActive.addEventListener("touchend", function(){
            changeFilter("ACTIVE");
        });
        showCompleted.addEventListener("touchend", function(){
            changeFilter("COMPLETED");
        });
        clear.addEventListener("touchstart", function(){
            clear.style.backgroundColor = "rgba(100, 149, 237, 0.52)";
        });
        clear.addEventListener("touchend", function(){
            clearCompleted();
            clear.style.backgroundColor = "cornflowerblue";
        });

        model.init(function(){
            data = model.data;
            let items = data.items;
            for(let i = items.length - 1; i >= 0; i--){
                addTodoItem(null, items[i]);
            }
            $("todo").value = data.msg;
        });
        update();
    };

    function clearCompleted(){
        let list = $("list");
        let i = 0, len;
        let child = list.firstChild;
        len = list.childElementCount - 1;
        while(i < len) {
            let next = child.nextSibling;
            if(data.items[i].completed){
                list.removeChild(child);
                data.items.splice(i, 1);
                model.flush();
                i--;
                len--;
                allItem--;
            }
            i++;
            child = next;
        }
        update();
    }

    function changeFilter(filter){
        let list = $("list");
        let showAll = $("show-all");
        let showActive = $("show-active");
        let showCompleted = $("show-completed");
        if(filter === "ALL"){
            showAll.className = "item-type-active";
            showActive.className = "item-type";
            showCompleted.className = "item-type";
            showAll.style.zIndex = "2";
            showActive.style.zIndex = "1";
            showCompleted.style.zIndex = "0";
            model.data.filter = "ALL";
            let i = 0, len;
            let child = list.firstChild;
            len = list.childElementCount - 1;
            while(i < len) {
                child.style.display = "block";
                i++;
                child = child.nextSibling;
            }
        }
        else if(filter === "ACTIVE"){
            showActive.className = "item-type-active";
            showAll.className = "item-type";
            showCompleted.className = "item-type";
            showAll.style.zIndex = "1";
            showActive.style.zIndex = "2";
            showCompleted.style.zIndex = "0";
            model.data.filter = "ACTIVE";
            let i = 0, len;
            let child = list.firstChild;
            len = list.childElementCount - 1;
            while(i < len) {
                child.style.display = data.items[i].completed ? "none" : "block";
                i++;
                child = child.nextSibling;
            }
        }
        else if(filter === "COMPLETED"){
            showCompleted.className = "item-type-active";
            showActive.className = "item-type";
            showAll.className = "item-type";
            showCompleted.style.zIndex = "2";
            showAll.style.zIndex = "0";
            showActive.style.zIndex = "1";
            model.data.filter = "COMPLETED";
            let i = 0, len;
            let child = list.firstChild;
            len = list.childElementCount - 1;
            while(i < len) {
                child.style.display = data.items[i].completed ? "block" : "none";
                i++;
                child = child.nextSibling;
            }
        }
        model.flush();

        let nothing = $("nothing");
        if((allItem === activeItem && model.data.filter === "COMPLETED") ||
            (activeItem === 0 && allItem > 0 && model.data.filter === "ACTIVE")){
            nothing.style.display = "block";
        }
        else{
            nothing.style.display = "none";
        }
        $("clear").style.display = (allItem - activeItem > 0 && model.data.filter !== "ACTIVE") ? "block" : "none";
    }

    function findIndex(parent, target){
        var i, len;
        var child = parent.firstChild;
        i = 0;
        len = parent.childElementCount - 1;
        while(i < len) {
            if(child === target) {
                return i;
            }
            i++;
            child = child.nextSibling;
        }
    }

    function addTodoItem(event, stItem) {
        let input = $("todo");
        let list = $("list");
        if (input.value || stItem) {
            if(input.value){
                data.items.unshift({
                    msg: input.value,
                    completed: false
                });
            }
            model.flush();
            let node = document.createElement("div");
            node.className = "list-item";
            let item = document.createElement("div");
            item.className = "todo-item";
            node.appendChild(item);
            let text = document.createElement("span");
            text.className = (stItem && stItem.completed) ? "todo-text-done" : "todo-text";
            text.innerHTML = stItem ? stItem.msg : input.value;
            item.appendChild(text);
            let buttons = document.createElement("div");
            buttons.className = "buttons";
            item.appendChild(buttons);
            let completeButton = document.createElement("button");
            completeButton.className = (stItem && stItem.completed) ? "recoverButton" : "completeButton";
            completeButton.innerHTML = "&radic;";
            completeButton.addEventListener("touchend", function () {
                if (completeButton.className === "completeButton") {
                    completeButton.className = "recoverButton";
                    text.className += "-done";
                    activeItem--;
                    data.items[findIndex(list, node)].completed = true;
                    model.flush();
                    update();
                }
                else if (completeButton.className === "recoverButton") {
                    completeButton.className = "completeButton";
                    text.className = "todo-text";
                    activeItem++;
                    data.items[findIndex(list, node)].completed = false;
                    model.flush();
                    update();
                }
            }, false);
            item.insertBefore(completeButton, item.firstChild);
            let delButton = document.createElement("button");
            delButton.className = "delButton";
            delButton.innerHTML = "&times;";
            delButton.addEventListener("touchend", function () {
                data.items.splice(findIndex(list, node), 1);
                model.flush();
                list.removeChild(node);
                if(completeButton.className === "completeButton")
                    activeItem--;
                allItem--;
                update();
            }, false);
            buttons.appendChild(delButton);
            list.insertBefore(node, list.firstChild);

            var longClick = 0;
            var timeOutEvent;
            text.addEventListener("touchstart", function(){
                longClick=0;
                timeOutEvent = setTimeout(function(){
                    longClick = 1;
                    clearTimeout(timeOutEvent);
                    if(timeOutEvent !== 0 && longClick === 1 && completeButton.className === "completeButton"){
                        item.className += "-editing";
                        node.className += "-editing";
                        var edit = document.createElement("input");
                        edit.className = "edit";
                        edit.type = "text";
                        edit.value = text.innerHTML;
                        edit.placeholder = text.innerHTML;
                        edit.maxLength = "15";

                        // noinspection JSAnnotator
                        function finish(){
                            item.className = "todo-item";
                            node.className = "list-item";
                            node.removeChild(edit);
                            node.removeChild(save);
                        }

                        edit.addEventListener("blur", finish);

                        var save = document.createElement("div");
                        save.className = "todo-button";
                        save.innerHTML = "Save";
                        save.addEventListener("touchend", function () {
                            if(edit.value) {
                                text.innerHTML = edit.value;
                                data.items[findIndex(list, node)].msg = edit.value;
                                model.flush();
                            }
                            item.className = "todo-item";
                            node.className = "list-item";
                            edit.style.display = "none";
                            save.style.display = "none";
                        });

                        node.appendChild(edit);
                        node.appendChild(save);
                        edit.focus();
                    }
                    longClick = 0;
                },1000);
            });
            text.addEventListener("touchmove", function(e){
                console.log("move");
                clearTimeout(timeOutEvent);
                timeOutEvent = 0;
                e.preventDefault();
            });
            text.addEventListener("touchend", function(){
                clearTimeout(timeOutEvent);
                // if(timeOutEvent !== 0 && longClick === 1 && completeButton.className === "completeButton"){
                //     item.className += "-editing";
                //     node.className += "-editing";
                //     var edit = document.createElement("input");
                //     edit.className = "edit";
                //     edit.type = "text";
                //     edit.value = text.innerHTML;
                //     edit.placeholder = text.innerHTML;
                //     edit.maxLength = "15";
                //
                //     // noinspection JSAnnotator
                //     function finish(){
                //         item.className = "todo-item";
                //         node.className = "list-item";
                //         node.removeChild(edit);
                //         node.removeChild(save);
                //     }
                //
                //     edit.addEventListener("blur", finish);
                //
                //     var save = document.createElement("div");
                //     save.className = "todo-button";
                //     save.innerHTML = "Save";
                //     save.addEventListener("touchend", function () {
                //         if(edit.value) {
                //             text.innerHTML = edit.value;
                //             data.items[findIndex(list, node)].msg = edit.value;
                //             model.flush();
                //         }
                //         item.className = "todo-item";
                //         node.className = "list-item";
                //         edit.style.display = "none";
                //         save.style.display = "none";
                //     });
                //
                //     node.appendChild(edit);
                //     node.appendChild(save);
                //     edit.focus();
                // }
                // longClick = 0;
                // return false;
            });
            activeItem += (stItem && stItem.completed) ? 0 : 1;
            allItem++;
            update();
            input.value = "";
        }
        $("add").style.backgroundColor = "cornflowerblue";
    }

    function update(){
        updateActiveItem();
        changeFilter(model.data.filter);
    }

    function updateActiveItem() {
        $("active").innerHTML = (activeItem !== 0 ? activeItem : "No") + " items left";
        $("bottom").style.display = allItem !== 0 ? "block" : "none";
    }
})();
