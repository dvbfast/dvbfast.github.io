
/**
 * Entry point, inits Materialize CSS and first round of Data
 */
async function init() {
    //@ts-ignore
    M.AutoInit();
    initData();
}
init();

//"cache" of close Stations.
var closeStations: rawDataStationElement[] = [];

/**
 * inits all data, by retrieving the closest stations and updating the HTML of the document
 */
async function initData(): Promise<true> {
    return new Promise(async (resolve, reject) => {
        closeStations = await getCloseStations()
        await updateHTMLWithDepartures();
        resolve(true);
    });
}

/**
 * Get the closest Stations. No parameter required. Retrieves the GPS-Data itself by calling getPosition();
 */
async function getCloseStations(): Promise<rawDataStationElement[]> {
    return new Promise(async (resolve, reject) => {
        var position: any = null;
        try {
            position = await getPosition();
        } catch (e) {
            showPush("Bitte lassen Sie die Standorterkennung zu, damit Stationen in der Nähe erkannt werden können. Eventuell wird dies von ihrem Gerät nicht unterstützt, oder Sie müssen erst ihrem Browser die Berechtigung erteilen.", 20000);
            return;
        }
        if (position == null) {
            showPush("Standort kann nicht bestimmt werden.");
            return;
        }
        var closeStations: rawDataStationElement[] = findCloseStations(position.coords.latitude, position.coords.longitude);
        //var closeStations:rawDataStationElement[] = findCloseStations(51.053533, 13.816152); //Seilbahnen testen
        //var closeStations:rawDataStationElement[] = findCloseStations(51.039867, 13.733739); Hauptbahnhof
        if (closeStations == undefined || closeStations == null) {
            showPush("Stationen in der konntent nicht gefunden werden.");
            return;
        }
        if (closeStations.length <= 0) {
            showPush("Keine Stationen in dem Radius gefunden.");
            return;
        }
        resolve(closeStations);
    });
}

/**
 * Updates the HTML with the departures boxes
 */
async function updateHTMLWithDepartures() {
    return new Promise(async (resolve, reject) => {
        var html = "";
        for (const station of closeStations) {
            var departures = await getDeparturesOfStation(station);
            if (departures == undefined || departures == null) {
                showPush("Fehler beim Laden der nächsten Verbindungen.");
                resolve(false);
                return;
            }
            html += generateBox(station, departures);

        }
        var target = document.getElementById("boxcontainer");
        if (target == null) {
            showPush("Interner Fehler.");
            resolve(false);
            return;
        }
        target.innerHTML = html;
        resolve(true);
    });
}

/**
 * Shows a notofication
 * @param message Message to display as push notification 
 */
function showPush(message: string, displayLength = 4000) {
    //@ts-ignore
    M.toast({ html: message, displayLength: displayLength })
}