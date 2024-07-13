const details = document.getElementById("details")

const file_btn = document.getElementById("filetab");
const newfile_btn = document.getElementById("newfile");
const openfile_btn = document.getElementById("openfile");
const savefile_btn = document.getElementById("savefile");
const saveas_btn = document.getElementById("saveas");
const saveall_btn = document.getElementById("saveall");
const autosave_btn = document.getElementById("autosave");
const autorun_btn = document.getElementById("autorun");

const edit_btn = document.getElementById("edittab");
const rename_btn = document.getElementById("rename");
const cut_btn = document.getElementById("cut");
const copy_btn = document.getElementById("copy");
const paste_btn = document.getElementById("paste");
const replace_btn = document.getElementById("replace");

const help_btn = document.getElementById("help");

const codeTablist = document.getElementById("codetablist");
const view_btn = document.getElementById("viewbtn");
const run_btn = document.getElementById("runbtn");

const codeEditor = document.getElementById("codeEditor");
const iFrame = document.getElementById("iFrameSection");
const iFrameHeader = document.getElementById("iFrameHeader");
const iFrameTitle = document.getElementById("iFrameTitle");
const iFrameClose = document.getElementById("iFrameClose");
const iFrameView = document.getElementById("iFrameFullScreen");
const iFrameCodeWindow = document.getElementById("iFramePreview");

/* key for each file would be _codeEditor.tabNames.[name-of-file] and would store an object consisting of date-created, date-last-modified, file(type string)*/
const keyPrefix = "_codeEditor";
const keyPrefixTabNames = `${keyPrefix}.tabNames`;
let autosaveId = null;
let autorunId = null;
let activeTab;
let activeTabName = "";
let loadedTabs = [];
let activeTabAltered = false;
//let loadedTabs = JSON.parse(localStorage.getItem(keyPrefixTabNames)) || [];
//let untitled_count = 0;

/* Functions */
function untitled_count() {
  return Math.round(Math.random() * 1000);
}
function switchActiveState(item) {
  if (item.innerText === activeTabName) {
    activeTab = item;
    activeTab.classList.add("activetab");
  } else {
    item.classList.remove("activetab");
  }
}
function loadCode(name) {
  codeEditor.value = null;
  let codeObject = JSON.parse(
    localStorage.getItem(`${keyPrefixTabNames}.${name}`)
  );
  if (codeObject) {
    codeEditor.value = codeObject.file;
  } else { codeEditor.value = ""; }
}
function cancel_btn(itemName) {
  let cancel = document.createElement("div");
  cancel.classList.add("cancel");
  cancel.dataset.name = itemName;
  cancel.addEventListener("click", (e) => {
    e.stopImmediatePropagation(); //to make sure event listener on the list is not run which automatically saves code entry
    let answer = true;
    if (activeTabAltered) {
      answer = confirm("Would you like to save this file?");
    }
    if (answer) {
      save(itemName);
    }
    let closingIndex = loadedTabs.findIndex((item) => item === activeTabName);
    loadedTabs = loadedTabs.filter((item) => item !== cancel.dataset.name);
    //activeTabAltered = true;
    codeEditor.value = null;
    //it's not responding properly yet
    if (loadedTabs.length > 0) {
      //to make sure the active switches out when it is closed
      if (loadedTabs[closingIndex]) {
        //if tab closed isn't last
        activeTabName = loadedTabs[closingIndex];
      } else if (loadedTabs[closingIndex - 1]) {
        //if it is last
        activeTabName = loadedTabs[closingIndex - 1];
      }
    } else {
      activeTabName = null;
    }
    loadTabs();
  });
  return cancel;
}
function loadTabs() {
  if (!activeTabName?.endsWith(".html")) {
    run_btn.style["display"] = "none";
    document.querySelector(".autoRunIndicator").classList.remove("visible");
  }
  /* Puts all items on the loadedTabs array into the tabs and adds the event listener that sets the code editor to reflect the opened name */
  codeTablist.innerHTML = null;
  loadedTabs.forEach((item) => {
    let liEl = document.createElement("li");
    liEl.innerText = item;
    liEl.appendChild(cancel_btn(item));
    if (item === activeTabName) {
      activeTab = liEl;
      liEl.classList.add("activetab");
      codeEditor.value = JSON.parse(
        localStorage.getItem(`${keyPrefixTabNames}.${activeTabName}`)
      )
        ? JSON.parse(
            localStorage.getItem(`${keyPrefixTabNames}.${activeTabName}`)
          )["file"]
        : "";

      if (item.endsWith(".html")) {
        document.querySelector(".autoRunIndicator").classList.add("visible");
        run_btn.style["display"] = "inline-block";
      } else {
        document.querySelector(".autoRunIndicator").classList.remove("visible");
        run_btn.style["display"] = "none";
        clearInterval(autorunId);
      }
    }
    liEl.addEventListener("click", (e) => {
      /* relodes the main with the code that matches the name from the localstorage */
      save();
      activeTab = e.target;
      activeTabName = e.target.innerText;
      switchActiveState(activeTab);
      loadTabs();
      loadCode(e.target.innerText);
      //activeTabAltered = true;
    });
    codeTablist.appendChild(liEl);
  });
  if (loadedTabs.length > 0) {
    codeEditor.focus()
  }
}
function save(name = activeTabName) {
  if (name) {
    let elementToSave =
      JSON.parse(
        localStorage.getItem(`${keyPrefixTabNames}.${name}`)
      ) || {};

    if (!elementToSave["date-created"]) {
      elementToSave["date-created"] = new Date().toString();
    }
    if (!elementToSave["file"]) {
      elementToSave["file"] = "";
    }
    if (!elementToSave["name"]) {
      elementToSave["name"] = name;
    }
    if (codeEditor.value !== elementToSave["file"]) {
      elementToSave["date-last-modified"] = new Date().toString();
      elementToSave["file"] = codeEditor.value;
      activeTabAltered = false;
    }
    let tabContent =
      JSON.parse(localStorage.getItem(`${keyPrefixTabNames}`)) || [];
    if (!tabContent.includes(name)) {
      tabContent.push(`${name}`);
      localStorage.setItem(`${keyPrefixTabNames}`, JSON.stringify(tabContent));
    }
    localStorage.setItem(
      `${keyPrefixTabNames}.${name}`,
      JSON.stringify(elementToSave)
    );
  } else {
    alert("No active tab selected, Please select one now");
  }
}
function renameAndSaveas(replace) {
  if (!activeTabName) {
    //to make sure a tab is active before rename or saveas can be triggered
    alert("No active tab selected");
    return;
  }
  document.querySelector(".rename-form").style["display"] = "inline-block";
  document.getElementById("renameSubmit").addEventListener("click", (e) => {
    e.preventDefault();
    save();
    let newName = document.getElementById("renameInput").value;
    let tabNames = JSON.parse(localStorage.getItem(keyPrefixTabNames));
    if (replace) {
      let index = tabNames.findIndex((item) => item === activeTabName);
      loadedTabs = loadedTabs.map((item) => {
        if (item === activeTabName) {
          return newName;
        } else return item;
      });
      tabNames[index] = newName;
    } else {
      tabNames.push(newName);
      loadedTabs.push(newName);
    }
    localStorage.setItem(keyPrefixTabNames, JSON.stringify(tabNames));
    let localEntry = JSON.parse(
      localStorage.getItem(`${keyPrefixTabNames}.${activeTabName}`)
    );
    localEntry["date-created"] = new Date().toString();
    localEntry["date-modified"] = new Date().toString();
    if (replace)
      localStorage.removeItem(`${keyPrefixTabNames}.${activeTabName}`);
    localStorage.setItem(
      `${keyPrefixTabNames}.${newName}`,
      JSON.stringify(localEntry)
    );
    document.querySelector(".rename-form").style["display"] = "none";
    activeTabName = newName;
    loadTabs();
  });
}
function run() {
  //if (activeTabName.endsWith(".html") && activeTabAltered) {
  if (activeTabName.endsWith(".html")) {
    //save();
    //opens up the iFrame and begins the magic
    if (activeTabAltered || iFrame.style["display"] === "none" || iFrame.style['display'] === "") {
      iFrame.style["display"] = "inline-block";
      iFrameView.innerText = "View";
      iFrame.classList.add("visible");
      let codeView = document.createElement("iframe");
      codeView.setAttribute("name", activeTabName);
      codeView.setAttribute("title", activeTabName);
      //sandbox prevents javascript code from running from the script so add it as some security feature if needed
      //codeView.setAttribute("sandbox", "");
      let editorHtml = codeEditor.value;
      //srcdoc is supposed to receive a converted code of some format it can recognized but seems to work fine in chrome and edge without the conversion
      codeView.setAttribute("srcdoc", editorHtml);
      iFrameCodeWindow.innerHTML = null;
      iFrameTitle.innerText = activeTabName;
      iFrameCodeWindow.appendChild(codeView);
    }
    activeTabAltered = false;
  } else if (!activeTabName.endsWith(".html")) {
    alert("This editor only runs .html files");
  }
}
function autoSaveAndRun(type = "save", Indicator) {
  if (activeTabName) {
    let indicator = Indicator;
    let id = type === "save" ? autosaveId : autorunId;
    if (id) {
      clearInterval(id);
      autosaveId = id === autosaveId ? null : autosaveId;
      autorunId = id === autorunId ? null : autorunId;
      indicator.style["background-color"] = "red";
    } else {
      indicator.style["background-color"] = "green";
      if (type === "save") {
        autosaveId = setInterval(() => {
          save();
        }, 2000);
      } else if (type === "run") {
        autorunId = setInterval(() => {
          run();
          save();
        }, 2000);
      } else if (type === "both") {
        alert("auto save and auto run combination not implemented yet");
      }
    }
  } else {
    alert("Please select a file");
  }
}
function loadDetails(name = activeTabName) {
  if (name) {
    let elementInStorage = JSON.parse(localStorage.getItem(`${keyPrefixTabNames}.${name}`)) || {};
    document.querySelector('#details .detailsBox').innerHTML = `
    <p>File Name: ${elementInStorage['name']}</p>
    <p>Date Created: ${elementInStorage['date-created']}</p>
    <p>Date Last-Modified: ${elementInStorage['date-last-modified']}</p>
    <p>File char length: ${elementInStorage['file'].length}</p>
    `
  } else {
    document.querySelector('#details .detailsBox').innerHTML = name;
  }
}
/* Event Listeners */
savefile_btn.addEventListener("click", () => {
  save();
});
document.querySelector(".autoSaveIndicator").addEventListener("click", () => {
  autoSaveAndRun(
    "save",
    document.querySelector(".autoSaveIndicator .colorIndicator")
  );
});
document.querySelector(".autoRunIndicator").addEventListener("click", () => {
  autoSaveAndRun(
    "run",
    document.querySelector(".autoRunIndicator .colorIndicator")
  );
});

file_btn.addEventListener("click", () => {
  document.querySelector(".filedropdown").style["display"] =
    document.querySelector(".filedropdown").style["display"] === "block"
      ? "none"
      : "block";
});
file_btn.addEventListener("mouseleave", () => {
  setTimeout(() => {
    document.querySelector(".filedropdown").style["display"] = "none";
  }, 400);
});
autosave_btn.addEventListener("click", () => {
  autoSaveAndRun(
    "save",
    document.querySelector(".appheader .autoSaveIndicator .colorIndicator")
  );
});
autorun_btn.addEventListener("click", () => {
  autoSaveAndRun(
    "run",
    document.querySelector(".appheader .autoRunIndicator .colorIndicator")
  );
});
newfile_btn.addEventListener("click", () => {
  if (activeTabName) save();
  activeTabName = `Untitled-${untitled_count()}`;
  loadedTabs.push(activeTabName);
  loadTabs();
});

openfile_btn.addEventListener("click", (e) => {
  let cover = document.querySelector(".override-cover");
  cover.style["display"] = "grid";
  let savedTabs = JSON.parse(localStorage.getItem(keyPrefixTabNames));
  if (!savedTabs) {
    document.querySelector(".override-cover #override-cover-list").innerHTML =
      "<p>NO SAVED TABS</p><p>CLOSING PROMPT</p>";
    setTimeout(() => {
      cover.style["display"] = "none";
    }, 1200);
  } else {
    let coverList = document.getElementById("override-cover-list");
    coverList.innerHTML = null; /* Remove what was there before */
    savedTabs.forEach((item) => {
      let liEl = document.createElement("li");
      liEl.innerText = item;
      if (item.endsWith(".html")) {
        liEl.classList.add("Html");
      }
      liEl.addEventListener("click", () => {
        /* Close the entire prompt, find the corresponding code in the local storage and renders if not currently in the open tabs*/
        cover.style["display"] = "none";
        if (!loadedTabs.includes(item)) {
          loadedTabs.push(item);
        } else {
          alert("Tab already open");
        }
        activeTabName = item;
        loadTabs();
      });
      coverList.appendChild(liEl);
    });
  }
});
document.querySelector(".override-cover").addEventListener("click", () => {
  document.querySelector(".override-cover").style["display"] = "none";
});
/* newfile_btn.addEventListener("click", () => {}); */
edit_btn.addEventListener("click", () => {
  document.querySelector(".editdropdown").style["display"] =
    document.querySelector(".editdropdown").style["display"] === "block"
      ? "none"
      : "block";
});
edit_btn.addEventListener("mouseleave", () => {
  setTimeout(() => {
    document.querySelector(".editdropdown").style["display"] = "none";
  }, 400);
});
rename_btn.addEventListener("click", () => {
  renameAndSaveas(true);
});
saveas_btn.addEventListener("click", (e) => {
  renameAndSaveas(false);
});
view_btn.addEventListener("click", () => {
  let appMain = document.querySelector(
    ".twoSections #appPlusPreviewMain .appmain"
  );
  appMain.classList.toggle("fullscreen");
});
run_btn.addEventListener("click", () => {
  run();
});
codeEditor.addEventListener("keydown", (e) => {
  if (e.code) activeTabAltered = true;
  //learn how to find the cursor location with javascript
});
iFrameView.addEventListener("click", () => {
  iFrame.classList.toggle("fullscreen");
});
iFrameClose.addEventListener("click", () => {
  iFrame.style["display"] = "none";
  clearInterval(autorunId);
  autorunId = null;
  document.querySelector(".appheader .autoRunIndicator .colorIndicator").style[
    "background-color"
  ] = "red";
  iFrame.classList.remove("fullscreen");
  iFrame.classList.remove("visible");
  /* Also add code to clear content */
  iFrameView.innerHTML = null;
});
document.querySelector(".detailsImage").addEventListener("click", () => {
  if (activeTabName) {
    document.getElementById("details").style["display"] = "grid"
    loadDetails(activeTabName);
  }
})
details.addEventListener("click", () => {
  details.style["display"] = "none"
})
