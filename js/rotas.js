/*
 *  ----------------------------------
 *      Layer(s) de Base
 *  ----------------------------------
 */
var osm_mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});
var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});
var osm_topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	maxZoom: 17,
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

/*
* -----------------------
*   Leaflet map e Layer de base no arranque
* -----------------------
*/

var map = L.map('map', {
    center: [40.85, -8.41],
    zoom: 12,
    zoonInTitle: 'Aproximar', //não está a responder
    zoomOutTitle: 'Afastar', //não está a responder
    layers: [osm_mapnik]
});

/*
* -------------------------
*   Layers control
* -------------------------
*/

var baseMaps = {
    "OpenStreetMap": osm_mapnik,
    "OpenTopoMap": osm_topo,
    "Satélite": Esri_WorldImagery
};
L.control.layers(baseMaps, null, {
    collapsed: false
}).addTo(map);


/*
* ------------------------
*   Scale control
* ------------------------
*/
L.control.scale({
    position: 'bottomleft',
    imperial: false
}).addTo(map);

/*
* -------------------------
*   Créditos
* -------------------------
*/
map.attributionControl.setPrefix(
    '&copy; <a href="https://sites.google.com/view/fmtcultura/projeto">Projecto Alminhas</a>' + ' &copy; Mapa Interactivo: <a href="mailto:ezcorreia@gmail.com">Ezequiel Correia</a> | CR1: <a href="https://www.cm-lousada.pt/pages/665">CM Lousada</a> | <a href="http://leafletjs.com" title="A JS library for interactive maps">Leaflet</a>'
);

var lc = L.control.locate({
    strings: {
        title: "A minha posição!"
    },
    locateOptions: {
               maxZoom: 15
    }
});
lc.addTo(map);
/*
* ----------------------------
*   Plugin Leaflet.Elevation (Naruto adpatado(?) por Niel)
* ----------------------------
*/
/* ---------------------------
*   Configuração do Plugin; está a usar o lime-theme, mas posso criar um custom-theme
* ----------------------------
*/
var elevation_options = {
    theme: "ec-theme", //"scasb-theme", //"lime-theme",
    detached: false,
    elevationDiv: "#elevation-div",
    autohide: false,
    collapsed: true, //o perfil abre fechado, aparecendo uma imagem; quando abre tem um botão para fechar
    position: "bottomleft", //"topright",
    followMarker: true,
    autofitBounds: true,
    imperial: false,
    reverseCoords: false,
    acceleration: false,
    slope: "summary",
    speed: false,
    time: false,
    distance: true,
    altitude: true,
    summary: 'line',
    downloadLink: false, //'link'
    ruler: true,
    legend: false, //mostra/esconde a legenda
    almostOver: true,
    distanceMarkers: true,
    yAxisMin: 0, //forçar o Y
    waypoints: true,
    wptIcons: {
      '': L.divIcon({
            className: 'elevation-waypoint-marker',
            html: '<i class="elevation-waypoint-icon"></i>',
            iconSize: [30, 30],
            iconAnchor: [15, 30] //[4, 15] //[8, 30]
      }),
      'alm': L.divIcon({
            className: 'elevation-waypoint-marker',
            html: '<i class="elevation-waypoint-icon alm"></i>',
            iconSize: [30, 30],
            iconAnchor: [15, 30] //[8, 30]
      }),
      'start': L.divIcon({
            className: 'elevation-waypoint-marker',
            html: '<i class="elevation-waypoint-icon start"></i>',
            iconSize: [30, 30],
            iconAnchor: [15, 30] //[8, 30]
      }),
      'end': L.divIcon({
            className: 'elevation-waypoint-marker',
            html: '<i class="elevation-waypoint-icon end"></i>',
            iconSize: [30, 30],
            iconAnchor: [15, 30] //[8, 30]
      })

    },
    wptLabels: true,
    preferCanvas: true,
    /*
    gpxOptions: {
        marker_options: {
        startIconUrl: '../pin-icon-start.png',
        endIconUrl: '../pin-icon-end.png',
        shadowUrl: '../pin-shadow.png'
        }
    },*/
};
// é necessário leaflet-gpx.js ?

/*
* --------------------
* Personaliza a info
* --------------------
*/
const mylocale = {
    "Total Length: ":"Dist. total: ",
    "Max Elevation: ":" Alt. max: ",
    "Min Elevation: ":" Alt. min: ",
    "Total Ascent: ":" D+ ",
    "Total Descent: ":" D- ",
};

L.registerLocale('pt', mylocale);
L.setLocale('pt');

var controlElevation = L.control.elevation(elevation_options).addTo(map);

/*
* ----------------------
* Carrega o perfil e a rota - ficheiro gpx ou geojson
* ----------------------
*/

controlElevation.load("data/rota_lousada.gpx");

/*
* ----------------------
* Abre uma imagem ampliada
* ----------------------
*/

// Get the modal
var modal = document.getElementById("myModal");

// Get the image and insert it inside the modal - use its "alt" text as a caption
var img = document.getElementById("myImg");
var modalImg = document.getElementById("img01");
var captionText = document.getElementById("caption");
img.onclick = function(){
  modal.style.display = "block";
  modalImg.src = this.src;
  captionText.innerHTML = this.alt;
}

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}
