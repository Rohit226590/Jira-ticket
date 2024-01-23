let addbtn = document.querySelector(".add-btn");
let removebtn = document.querySelector(".remove-btn");
let modalcont = document.querySelector(".modal-cont");
let maincont = document.querySelector(".main-cont");
let textareacont = document.querySelector(".textarea-cont");
let allprioritycolors = document.querySelectorAll(".priority-colors");
let toolBoxcolors = document.querySelectorAll(".color");

let colors = ["lightgreen","lightpink", "lightblue", "black"];
let modalprioritycolor = colors[colors.length - 1];

let addflag = false;
let removeflag = false;
let lockclass = "fa-lock";
let unlockclass = "fa-lock-open";
// for toolbox
let ticketsArr = [];
if (localStorage.getItem("jira_tickets")) {
    //retrive and display
    ticketsArr = JSON.parse(localStorage.getItem("jira_tickets"));
    ticketsArr.forEach((ticketobj) => {
        createTicket(ticketobj.ticketcolor, ticketobj.tickettask, ticketobj.ticketid)
    })
}
for (let i = 0; i < toolBoxcolors.length; i++) {
    toolBoxcolors[i].addEventListener("click", (e) => {
        let currentToolBoxcolors = toolBoxcolors[i].classList[0];

        let fileredtickets = ticketsArr.filter((ticketobj, idx) => {
            return currentToolBoxcolors === ticketobj.ticketcolor;
        })
        // remove previous tickets
        let allticketscont = document.querySelectorAll(".ticket-cont");
        for (let i = 0; i < allticketscont.length; i++) {
            allticketscont[i].remove();

        }
        //display new filtered tickets
        fileredtickets.forEach((ticketobj, idx) => {
            createTicket(ticketobj.ticketcolor, ticketobj.tickettask, ticketobj.ticketid);
        })
    })
    toolBoxcolors[i].addEventListener("dblclick", (e) => {
        let allticketscont = document.querySelectorAll(".ticket-cont");
        for (let i = 0; i < allticketscont.length; i++) {
            allticketscont[i].remove();
        }
        ticketsArr.forEach((ticketobj, idx) => {
            createTicket(ticketobj.ticketcolor, ticketobj.tickettask, ticketobj.ticketid);
        })
    })


}


//listener for modal priority coloring
allprioritycolors.forEach((colorEle, idx) => {
    colorEle.addEventListener("click", (e) => {
        allprioritycolors.forEach((prioritycolorEle, idx) => {
            prioritycolorEle.classList.remove("border");
        })
        colorEle.classList.add("border");
        modalprioritycolor = colorEle.classList[0];

    })
})
addbtn.addEventListener("click", (e) => {
    //display modal
    //generate ticket

    //addflag, true->modal display
    // addflag, false->modal none
    addflag = !addflag;
    if (addflag) {
        modalcont.style.display = "flex";

    } else {
        modalcont.style.display = "none";
    }


})
removebtn.addEventListener("click", (e) => {
    removeflag = !removeflag;

})
modalcont.addEventListener("keydown", (e) => {
    let key = e.key;
    if (key === "Shift") {
        createTicket(modalprioritycolor, textareacont.value);
        addflag = false;
        setmodaltodefault();
    }
})
function createTicket(ticketcolor, tickettask, ticketid) {
    let id = ticketid || shortid();
    let ticketcont = document.createElement("div");
    ticketcont.setAttribute("class", "ticket-cont");
    ticketcont.innerHTML = `
        <div class="ticket-color ${ticketcolor}"></div>
        <div class="ticket-id">#${id}</div>
        <div class="task-area">${tickettask}</div>
        <div class="ticket-lock">
                <i class="fa-solid fa-lock"></i>
            </div>
        
        
        `;
    maincont.appendChild(ticketcont);

    //create object of ticket and add to array
    if (!ticketid) {
        ticketsArr.push({ ticketcolor, tickettask, ticketid: id });
        localStorage.setItem("jira_tickets", JSON.stringify(ticketsArr))

    }

    handleremoval(ticketcont, id);
    handlelock(ticketcont, id);
    handlecolor(ticketcont, id);
}
function handleremoval(ticket, id) {
    //remove flag-> true->
    ticket.addEventListener("click", (e) => {
        if (!removeflag) {
            return;
        }
        let idx = getTIcketidx(id);
        //DB removal
        ticketsArr.splice(idx, 1);
        let strticketsarr = JSON.stringify(ticketsArr);
        localStorage.setItem("jira_tickets", strticketsarr);
        ticket.remove();//ui removal

    })
}

function handlelock(ticket, id) {
    let ticketlockele = ticket.querySelector(".ticket-lock");
    let ticketlock = ticketlockele.children[0];
    let tickettaskarea = ticket.querySelector(".task-area")
    ticketlock.addEventListener("click", (e) => {
        let ticketidx = getTIcketidx(id);

        if (ticketlock.classList.contains(lockclass)) {
            ticketlock.classList.remove(lockclass);
            ticketlock.classList.add(unlockclass);
            tickettaskarea.setAttribute("contenteditable", "true");
        } else {
            ticketlock.classList.remove(unlockclass);
            ticketlock.classList.add(lockclass);
            tickettaskarea.setAttribute("contenteditable", "false");
        }
        //modify data in local storage
        ticketsArr[ticketidx].tickettask = tickettaskarea.innerText;
        localStorage.setItem("jira_tickets", JSON.stringify(ticketsArr));

    })
}

function handlecolor(ticket, id) {
    let ticketcolor = ticket.querySelector(".ticket-color");
    ticketcolor.addEventListener("click", (e) => {
        //gets ticketidx from the tickets array
        let ticketidx = getTIcketidx(id);
        let currentTicketcolor = ticketcolor.classList[1];
        //get ticket coler idx
        let currentTicketcoloridx = colors.findIndex((color) => {
            return currentTicketcolor === color;

        })
        currentTicketcoloridx++;
        let newticketcoloridx = currentTicketcoloridx % colors.length;
        let newticketcolor = colors[newticketcoloridx];
        ticketcolor.classList.remove(currentTicketcolor);
        ticketcolor.classList.add(newticketcolor);
        //modify data in localstorage
        ticketsArr[ticketidx].ticketcolor = newticketcolor;
        localStorage.setItem("jira_tickets", JSON.stringify(ticketsArr));
    })


}
function getTIcketidx(id) {
    let ticketidx = ticketsArr.findIndex((ticketobj) => {
        return ticketobj.ticketid === id;
    })
    return ticketidx;

}

function setmodaltodefault() {
    modalcont.style.display = "none";
    textareacont.value = "";
    modalprioritycolor = colors[colors.length - 1];
    allprioritycolors.forEach((prioritycolorEle, idx) => {
        prioritycolorEle.classList.remove("border");
    })
    allprioritycolors[allprioritycolors.length - 1].classList.add("border");
}

