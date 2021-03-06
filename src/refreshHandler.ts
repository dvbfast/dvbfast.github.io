
const intervallTimeInSeconds:number = 20; //time in seconds for the auto-refresh

let isDisabled:boolean = false;
let isCurrentlyLoading:boolean = false;
let currentRefreshState:number = 0; 
let initialLoad:boolean = true;//initial loading of the website

let lastRefeshTime:number = Date.now();


/**
 * This intervall checks, if the last update is more than intervallTimeInSeconds ago. 
 * This is neccessary, because if the website is in the background, phones pause the JavaScript 
 * After re-opening the website, the infos should be immediately refreshed.
 */
let lastRefreshIntervall = setInterval(()=>{
    const now = Date.now();
    const difference = now-lastRefeshTime;
    if(lastRefeshTime!==0&&difference>intervallTimeInSeconds*1500){
        lastRefeshTime = now;
        currentRefreshState = 0;
        refreshInfos();
    }
},300);

/**
 * Intervall that handles the progress of the auto refresh.
 */
let refreshIntervall = setInterval(() => {
    if (getIfAutorefreshIsEnabled() == false) {
        isDisabled = true;
    } else {
        isDisabled = false;
    }
    if (currentRefreshState > intervallTimeInSeconds || isCurrentlyLoading == true || isDisabled == true||initialLoad==true) {
        currentRefreshState = 0;
    } else {
        currentRefreshState += 1;
    }
    const progress = currentRefreshState / intervallTimeInSeconds;
    if (progress >= 1) {
        currentRefreshState = 0;
        refreshInfos();
        updateSearchResult();//in searchHandler.ts
    }
    updateRefreshButtonProgress(progress);
}, 1000)


/**
 * returns the switch state of auto refresh
 */
function getIfAutorefreshIsEnabled() {
    let disabledButton: any = document.getElementById("autorefreshSwitch");
    return disabledButton.checked;
}

/**
 * calling this function results in a renewal of the displayed data.
 */
async function refreshInfos() {
    if (isCurrentlyLoading == true) {
        return;
    }
    let thisTimeout = setTimeout(() => {
        isCurrentlyLoading = false;
    }, 120000);//two minutes
    isCurrentlyLoading = true;
    setSpinnerState("on");
    await initData();
    setSpinnerState("off");
    lastRefeshTime = Date.now();
    clearTimeout(thisTimeout);
    isCurrentlyLoading = false;
}

/**
 * Sets the state of the icon in the refresh-button
 * @param state state of the spinner
 */
function setSpinnerState(state: "on" | "off") {
    let spinner = document.getElementById("refreshSpinner");
    if (state == "on") {
        spinner.classList.add("spinning");
    } else {
        spinner.classList.remove("spinning");
    }
}

/**
 * Sets the state of the switch that toggles the auto refresh
 * @param state state of the switch
 */
function setAutoRefreshSwitchState(state:"on"|"off"){
   let thisSwitch:any = document.getElementById("autorefreshSwitch");
if(state=="on"){
    thisSwitch.checked  =true;
}else{
    thisSwitch.checked = false;
}
}

/**
 * Updates the gradient on the refresh button
 * @param progress in a range from 0 to 1
 */
function updateRefreshButtonProgress(progress: number) {
    let refreshbutton = document.getElementById("refreshButton");
    if (progress >= 1 || progress <= 0) {
        refreshbutton.setAttribute("style", "");
    } else {
        const progressCSS = generateProgressGradientString(progress);
        refreshbutton.setAttribute("style", progressCSS);
    }
}

/**
 * Generates a gradient from left to right that displays a progress
 * @param progress in a range from 0 to 1
 */
function generateProgressGradientString(progress: number) {
    const progressInPercent = progress * 100;
    let html = `background: linear-gradient(90deg, #ff8f00 0%, #f57c00 ${progressInPercent}%, #ff8f00 ${progressInPercent}%);`;
    return html;
}