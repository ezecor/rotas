/* @preserve
 *
 * Calcul d'itinéraire vélo via OpenRoute service
 * https://parcours.scasb.org 
 * 
 * This file is a part of the self hosted webapp mantioned above, 
 * it is free software: you can redistribute it and/or modify it under 
 * the terms of the GNU Affero General Public License as published by 
 * the Free Software Foundation, either version 3 of the License, 
 * or (at your option) any later version.
 *
 * This file is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>
 *
 * Copyright (c) 20Z0 Gérald Niel (https://framagit.org/gegeweb)
 *
 * @license magnet:?xt=urn:btih:0b31508aeb0634b347b8270c7bee4d411b5d4109&dn=agpl-3.0.txt AGPL-v3-or-later
 */

//(function(global, L) {
    /*
	window.addEventListener('load', async() => {
		'use strict';

		L = (typeof window !== "undefined" ? window['L'] : typeof global !== "undefined" ? global['L'] : null);

		// API Key OpenRoute Service
		let headers = new Headers(),
			request = new Request('config/ors_token.txt')
		headers.append('pragma', 'no-cache');
		headers.append('cache-control', 'no-cache');
		const ors_token = await fetch(request, {
				method: 'GET',
				headers: headers
			})
			.then(async response => { return response.text() });
        */
		// set initial waypoints, get from querystring
		/*
        let wps = getQueryLatLngs();

		const mylocale = {
			"Total Length: ": "Dist.&nbsp;: ",
			"Max Elevation: ": "Alt. max&nbsp;: ",
			"Min Elevation: ": "Alt. min&nbsp;: ",
			"Total Ascent: ": "D+ ",
			"Total Descent: ": "D- ",
		};

		L.registerLocale('fr', mylocale);
		L.setLocale('fr');
        */

		/*
		 * Update options on change in form options
		 */
		/*
        const formulaire = document.getElementById('form-settings');
		formulaire.reset();

		formulaire.querySelectorAll("input, select").forEach((el) => {
			L.DomEvent.on(el, 'change', formChange)
		});
        */
        
		/*
		 *  ----------------------------------
		 *           Initialize Map
		 *  ----------------------------------
		 */

		let mapBounds = L.latLngBounds(L.latLng(41.2, -9.5), L.latLng(41.1, -9.9));
		let map = L.map('map', {
			zoomControl: false,
		}).fitBounds(mapBounds, {
			padding: [5, 5]
		});
		map.attributionControl.addAttribution(
			'Routes: <a href="https://openrouteservice.org/terms-of-service/">Openroute Service</a> | \
        <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
		).setPrefix(
			'<a href="https://leafletjs.com/" title="A JS library for interactive maps">Leaflet</a> | \
        &copy;2020 Gérald Niel - AGPL v3 - sources sur <a href="https://framagit.org/gegeweb/scasb-calcul-itineraires-velo">Framagit</a>'
		);

		// Control Zoom
		L.control.zoom({
			position: 'topright',
			zoomInTitle: 'Aproximar',
			zoomOutTitle: 'Afastar'
		}).addTo(map);

		// Control Scale
		L.control.scale({
			imperial: false,
			position: 'bottomright'
		}).addTo(map);

		/*
		 *  ----------------------------------
		 *           Base Layer(s)
		 *  ----------------------------------
		 */

		let baseLayers = {
			'OSM France': L.tileLayer(
				'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
					attribution: 'Map: <a href="https://www.openstreetmap.fr/mentions-legales/">OpenStreetMap France</a>, \
            Map Data &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
				}
			).addTo(map),
			'OSM Mapnik': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				maxZoom: 19,
				attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
			}),
			'Cyclo OSM': L.tileLayer('https://dev.{s}.tile.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', {
				maxZoom: 20,
				attribution: '<a href="https://github.com/cyclosm/cyclosm-cartocss-style/releases" title="CyclOSM - Open Bicycle render">CyclOSM</a> \
            | Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
			}),
			'IGN': L.tileLayer(layerIGN(), {
				attribution: 'Map: &copy <a target="_blank" href="https://www.geoportail.gouv.fr/">Geoportail France</a>'
			}),
			'IGN Scan Express': L.tileLayer(layerIGN('GEOGRAPHICALGRIDSYSTEMS.MAPS.SCAN-EXPRESS.STANDARD'), {
				attribution: 'Map: &copy <a target="_blank" href="https://www.geoportail.gouv.fr/">Geoportail France</a>'
			}),
		};

		let reliefLayer = L.tileLayer('https://tiles.wmflabs.org/hillshading/{z}/{x}/{y}.png', {
			attribution: 'Hillshading: SRTM3 v2 (<a href="http://www.nasa.gov/">NASA</a>)'
		}).addTo(map);
		let overlayLayers = {
			'Relief': reliefLayer
		};

		/*
		 *  ----------------------------------
		 *              Sidebar
		 *  ----------------------------------
		 */
/*
		var sidebar = L.control.sidebar({
			autopan: true,
			closeButton: true,
			container: 'sidebar',
		}).addTo(map);

		// buttons
		sidebar.addPanel({ // Locate user position
			id: "locate",
			tab: '<i class="icon icon-locate"></i>',
			title: 'Localiser ma position',
			button: locatePosition
		});

		sidebar.addPanel({ // Fit to route bounds
			id: "fitroute",
			tab: '<i class="icon icon-trace"></i>',
			title: 'Centrer et zoomer sur la trace',
			button: fitToLayerBounds
		});
		sidebar.disablePanel('fitroute');

		sidebar.addPanel({ // Donwload (export) trace
			id: "dltrace",
			tab: '<i class="icon icon-save_alt"></i>',
			title: 'Exporter la trace au format GPX ou GeoJSON',
			button: exportTrace
		});
		sidebar.disablePanel('dltrace');

		sidebar.addPanel({ // copy url to clipboard
			id: 'copy-clipboard',
			tab: '<i class="icon icon-clipboard"></i>',
			title: "Copier l'url de la route dans le presse papier",
			button: () => {
				let wl = window.location,
					url = wl.protocol + '//' + wl.host + wl.pathname + buildQueryString(plan.getWaypoints());

				navigator.clipboard.writeText(url).then(() => {
					let div = document.getElementById('msg');
					div.innerHTML = '<p>URL copiée dans le presse papier.</p>';
					div.style.display = 'block';
					setTimeout(function() {
						div.style.display = 'none';
					}, 1500);

				});
			}
		});
		sidebar.disablePanel('copy-clipboard');

		sidebar.addPanel({ // Import trace or waypoints (gpx, kml, geojson)
			id: 'upload-trace',
			tab: '<i class="icon icon-publish">/i>',
			title: "Importer un fichier (gpx, kml, geojson)",
			button: uploadTrace
		});

		sidebar.addPanel({ // Hide or show elevation profil
			id: 'display-elevation',
			tab: '<i class="icon icon-elevation"></i>',
			title: 'Afficher/Masquer le profil altimétrique',
			button: () => {
				if (elevationControl._container.style.display === "none")
					elevationControl.show();
				else
					elevationControl.hide();
			},
			position: 'bottom'
		});
		sidebar.disablePanel('display-elevation');

		sidebar.addPanel({ // Display modal informations
			id: 'display-info',
			tab: '<i class="icon icon-info"></i>',
			title: 'Informations',
			button: () => {
				let div = document.getElementById("aide"),
					close = div.querySelector(".close");
				div.style.display = "block";

				close.onclick = function() {
					div.style.display = "none";
				}
				window.onclick = function(event) {
					if (event.target == div) {
						div.style.display = "none";
					}
				}
			},
			position: 'bottom'
		});
*/
	
        /*
		 *  ----------------------------------
		 *             Controls
		 *  ----------------------------------
		 */

		// Layers Control
		const controlLayer = L.control.layers(baseLayers, overlayLayers, {
			collapsed: false,
		});
		controlLayer.addTo(map);
		//setParent(controlLayer.getContainer(), L.DomUtil.get('layers-pane'));
/*
		// Geocoder to use with Geocoder and Rounting controls
		const orsGeocoder = L.Control.Geocoder.openrouteservice(ors_token, {
			geocodingQueryParams: {
				'boundary.country': 'FR'
			},
			reverseQueryParams: {
				'boundary.country': 'FR',
				size: 1
			},
			language: 'fr',
		});

		// Control Geocoder
		const controlGeocoder = L.Control.geocoder({
				position: 'topright',
				defaultMarkGeocode: false,
				showResultIcons: true,
				geocoder: orsGeocoder,
				addWaypoints: false,
				language: 'fr',
				iconLabel: 'Localiser une adresse',
				placeholder: 'Rechercher une adresse…',
			})
			.on('markgeocode', function(e) {
				// Add a waypoint for geocoded position
				if (this.options.addWaypoints) addWaypoint(e.geocode.center);

				// Fit Map to the geocoded bounds
				map.fitBounds(e.geocode.bbox);
			});
		controlGeocoder.addTo(map);

		// ROUTING
		const osrRouter = L.routing.openroute(ors_token, {
			format: 'json',
			language: 'fr',
			"timeout": 30 * 1000, // 30"
			"retries": 2,
			"retryDelay": 1000,
			"retryOn": [],
			"profile": getQueryProfile() || 'cycling-road',
			routingQueryParams: {
				"attributes": [
					"avgspeed",
					"percentage"
				],
				"elevation": "true",
				"extra_info": [
					"waytype",
					"surface",
					"waycategory",
					"suitability",
					"steepness",
					"tollways",
					"traildifficulty",
					"osmid",
					"roadaccessrestrictions",
					"countryinfo"
				],
				"id": "rounting_request",
				"instructions": "true",
				"instructions_format": "text",
				"language": "fr",
				"maneuvers": "true",
				"geometry": "true",
				"roundabout_exits": "true",
				"preference": "recommended"
			}
		});

		// Custom Plan, for markers
		const customPlan = L.Routing.Plan.extend({
				createGeocoders: function() {
					let container = L.Routing.Plan.prototype.createGeocoders.call(this),
						loopButton = this._loopBtn = createButton('', 'Retour au point de départ', 'leaflet-routing-loop hide', null, this._buttonContainer),
						scasbButton = this._scasbBtn = createButton('', 'Local SCASB', 'leaflet-routing-scasb', null, this._buttonContainer),
						eraseButton = this._eraseWpBtn = createButton('', 'Réinitialiser la route', 'leaflet-routing-erase-waypoint', null, this._buttonContainer),
						exportButton = this._exportRteBtn = createButton('', 'Exporter la route au format GPX', 'leaflet-routing-export-waypoint hide', null, this._buttonContainer),
						selectProfil = this._selectProfil = L.DomUtil.create('select', 'select_profil', this._buttonContainer),
						road = L.DomUtil.create('option', '', selectProfil),
						regular = L.DomUtil.create('option', '', selectProfil),
						mountain = L.DomUtil.create('option', '', selectProfil),
						electric = L.DomUtil.create('option', '', selectProfil);

					road.setAttribute('value', 'cycling-road');
					road.innerHTML = 'Vélo de route / course';
					regular.setAttribute('value', 'cycling-regular');
					regular.innerHTML = 'Vélo de ville / classique';
					mountain.setAttribute('value', 'cycling-mountain');
					mountain.innerHTML = 'VTT / Gravel';
					electric.setAttribute('value', 'cycling-electric');
					electric.innerHTML = 'Vélo électrique (VAE)';

					selectProfil.value = q('select[name=profil]', formulaire).value;

					L.DomEvent.on(selectProfil, 'change', (e) => {
						let target = e.target,
							value = target.value,
							select = q('select[name=profil]', formulaire);

						select.value = value;
						select.dispatchEvent(new Event('change'))
					});

					L.DomEvent.on(eraseButton, 'click', () => {
						this.setWaypoints([]);
						if (exportButton && !L.DomUtil.hasClass(exportButton, 'hide')) L.DomUtil.addClass(exportButton, 'hide');
						q('input[name=name]', formulaire).value = '';
						q('input[name=file_name]', formulaire).value = '';
					}, this);
					L.DomEvent.on(exportButton, 'click', () => {
						// we use Openroute Service wich return the route in GPX format
						let wps = this.getWaypoints();
						if (this.isReady()) {
							let opts = L.extend({}, osrRouter.options, { 'format': 'gpx' }),
								params = opts.routingQueryParams;

							L.extend(params, {
								'id': q('input[name=name]', formulaire).value || params.id
							});

							const routeurGPX = L.routing.openroute(ors_token, opts);
							routeurGPX.route(wps, gpx => {
								let isodate = (new Date()).toISOString(),
									filename = q('input[name=file_name]', formulaire).value || 'route.' + isodate;

								downloadTrace(gpx, filename, 'gpx');
							});
						}
					}, this);
					L.DomEvent.on(scasbButton, 'click', () => {
						let scasb = new L.Routing.Waypoint(
							new L.latLng(48.675040, 2.299469, 73),
							'Local SCASB'
						);

						L.extend(scasb, {
							properties: {
								"housenumber": '9',
								"street": 'Chemin de la Guy',
								"postalcode": '91160',
								"locality": 'Ballainvilliers',
								"country": 'France',
							}
						});
						this.addWaypoint(scasb);
					});
					L.DomEvent.on(loopButton, 'click', () => {
						this.addWaypoint(this.getWaypoints()[0]);
					});

					return container;
				},
			}),
			plan = new customPlan(wps, {
				geocoder: orsGeocoder,
				routeWhileDragging: true,
				reverseWaypoints: true,
				language: 'fr',
				dragStyles: [
					{ color: 'black', opacity: 0.15, weight: 9 },
					{ color: 'white', opacity: 0.8, weight: 6 },
					{ color: 'rgb(173, 53, 37)', opacity: 1, weight: 2, dashArray: '7,12' }
				],
				createMarker: createMarker,
			}).on('waypointgeocoded', wpGeocoded);

		// Control Routing (Leaflet Routing Machine)
		const controlRouting = L.routing.control({
				position: 'topright',
				collapsible: true,
				detached: true,
				itineraryDiv: 'itinerary-pane',
				geocodersDiv: 'geocoders-pane',
				router: osrRouter,
				plan: plan,
				formatter: L.routing.formatter_ors({
					language: 'fr',
					roundingSensitivity: 4,
					steptotext: false,
					unitNames: {
						meters: 'm',
						kilometers: 'km',
						yards: 'yd',
						miles: 'mi',
						hours: 'h',
						minutes: '\'',
						seconds: '\"'
					}
				}),
				lineOptions: {
					styles: [
						{ color: 'black', opacity: 0.9, weight: 6 },
						{ color: 'red', opacity: 1, weight: 4 },
						{ color: 'white', opacity: 1, weight: 2 }
					]
				},
				pointMarkerStyle: {
					radius: 6,
					color: 'black',
					fillColor: 'white',
					opacity: 1,
					fillOpacity: 1,
					weight: 1,
					pane: 'markerPane',
				},
				waypointMode: 'connect', // snap is more expansive with reverse geocode request
				routeDragInterval: 1000, // calculate every seconds while dragging point
				totalDistanceRoundingSensitivity: -3,
				routeWhileDragging: true, // false limits the requests to Openroute Service
				autoRoute: true,
				summaryTemplate: '<h3>{distance} – {time}</h3>',
			})
			.on('routeselected', function(e) {
				let layer = getLayer(),
					route = e.route,
					data = L.polyline(route.coordinates).toGeoJSON();

				L.extend(route, { name: q('input[name=name]', formulaire).value || 'Itinéraires' });

				elevationControl.clear();
				elevationControl.addData(data, layer);

				sidebar.enablePanel('itinerary-pane');
				sidebar.enablePanel('display-elevation');
				sidebar.enablePanel('fitroute');
				sidebar.enablePanel('dltrace');
				sidebar.enablePanel('copy-clipboard');

				L.DomUtil.removeClass(plan._exportRteBtn, 'hide');
				L.DomUtil.removeClass(plan._loopBtn, 'hide');
			})
			.on('waypointschanged', function(e) {
				if (!plan.isReady()) {
					L.DomUtil.addClass(plan._exportRteBtn, 'hide');
					L.DomUtil.addClass(plan._loopBtn, 'hide');

					elevationControl.clear();
					elevationControl.hide();
					sidebar.disablePanel('itinerary-pane');
					sidebar.disablePanel('display-elevation');
					sidebar.disablePanel('fitroute');
					sidebar.disablePanel('dltrace');
					sidebar.disablePanel('copy-clipboard');

					if (e.waypoints.length <= 2 && !e.waypoints[1].latLng && e.waypoints[0].latLng) {
						map.setView(e.waypoints[0].latLng, 15);
					}
				}
			})
			.on('stepover', function(e) {
				getLayer().fire('mousemove', { latlng: e.coord });
			})
			.on('stepout', function(e) {
				getLayer().fire('mouseout', { latlng: e.coord })
			});

		controlRouting.addTo(map);
*/
		// Elevation
		let elevationControl = L.control.elevation({
			lazyLoadJS: false,
			theme: "scasb-theme",
			detached: false,
			responsive: false,
			elevationDiv: "#elevation-div",
			autohide: false,
			collapsed: false,
			position: "bottomright",
			followMarker: false,
			imperial: false,
			reverseCoords: false,
			summary: 'line',
			margins: {
				top: 20,
				right: 5,
				bottom: 35,
				left: 50
			},
			width: 480,
			height: 160,
			yAxisMin: 0,
			legend: false,
			slope: 'summary',
			marker: 'position-marker',
			markerIcon: L.divIcon({
				className: 'marker-position',
				iconSize: [14, 14],
				iconAnchor: [7, 7]
			}),
		});
		elevationControl.addTo(map).hide();
        //EC
       // elevationControl.load("data/alminhas_rota_abergaria.gpx"); 
        
		// EasyPrint
/*		L.easyPrint({
			title: 'Exporter la carte',
			position: 'topright',
			sizeModes: ['Current', 'A4Portrait', 'A4Landscape'],
			defaultSizeTitles: {
				Current: 'Taille courante',
				A4Landscape: 'A4 Paysage',
				A4Portrait: 'A4 Portrait'
			},
			exportOnly: true,
			hideControlContainer: true,
		}).addTo(map);
*/
		// Display Routing Error
/*		L.Routing.errorControl(controlRouting, {
			header: 'La route ne peut être calculée',
			formatMessage: function(error) {
				if (error.status < 0) {
					return `<code>${error.message}</code>`;
				} else {
					return `<strong>Erreur ${error.status}</strong><br/><em>${error.message}</em>`;
				}
			}
		}).addTo(map);

		map.on('easyPrint-start', function() {
			if (map.hasLayer(reliefLayer)) {
				map.removeLayer(reliefLayer);
				map.once('easyPrint-finished', function() {
					map.addLayer(reliefLayer);
				});
			}
		});

		if (getQueryProfile()) {
			let profile = getQueryProfile();
			L.extend(osrRouter.options, { profile: profile });
			plan._selectProfil.value = profile;
			q('select[name=profil]', formulaire).value = profile;
		}
*/
		// Load local files
/*		if (getQueryParams('parcours')) {
			let parcours = getQueryParams('parcours'),
				geojson = await fetch('datas/geojson/' + parcours + '.geojson')
				.then(async response => {
					if (response.ok) return response.json();
					else return null;
				}).catch(e => {
					console.log(e);
					return null;
				});

			if (geojson) {
				wps = getWps(geojson);
				plan.setWaypoints(wps);
				q('input[name=file_name]', formulaire).value = parcours;

				// display profile when parcours loaded and route displayed
				controlRouting.once('routeselected', () => {
					if (elevationControl._container.style.display === "none")
						elevationControl.show();
				});
			}
		}

		if (wps.length < 1) {
			locatePosition()
		}

  */     
		/* 
		 *  ----------------------------------
		 *            Functions
		 *  ----------------------------------
		 */

		/**
		 * Retourne l'url du Layer IGN
		 * 
		 * @param {String} apikey 
		 * @param {String} layer
		 * 
		 * @returns {String} url
		 */
		/*
        function layerIGN(layer, apikey) {
			apikey = apikey || 'choisirgeoportail';
			layer = layer || 'GEOGRAPHICALGRIDSYSTEMS.MAPS';
			let url = "http://wxs.ign.fr/" + apikey +
				"/geoportail/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&" +
				"LAYER=" + layer + "&STYLE=normal&TILEMATRIXSET=PM&" +
				"TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image%2Fjpeg";
			return url;
		};
        */
		/**
		 * Download GPX file
		 * 
		 * @param {String|Object} data XML Document or GeoJSON Object
		 * @param {String} filename 
		 * @param {String} format 
		 */
		/*
        function downloadTrace(data, filename, format) {

			let mimetype = {
					'gpx': 'application/gpx+xml',
					'geojson': 'application/geo+json'
				},
				isjson = format === 'geojson',
				gpx = isjson ? JSON.stringify(data, null, '\t') : data,
				dlink = L.DomUtil.create('a'),
				blob = new Blob([gpx], { 'type': mimetype[format] }),
				url = window.URL.createObjectURL(blob);

			dlink.setAttribute('download', `${filename}.${format}`);
			dlink.setAttribute('href', url);

			L.DomEvent.on(dlink, 'click', () => {
				setTimeout(function() {
					window.URL.revokeObjectURL(dlink.href);
				}, 250);
			});
			dlink.click();
			L.DomUtil.remove(dlink);
		};
        */
		/**
		 * Set waypoints on locate with Locate Control
		 * or clicking on the map
		 * Alias function for plan.addWaypoint()
		 * 
		 * @param {Object} L.LatLng() latlng 
		 */
		/*
        function addWaypoint(latlng) {
			plan.addWaypoint(latlng);
		};
        */
		/**
		 *
		 * @param {String} label
		 * @param {String} title
		 * @param {Object} container
		 *
		 * @return {Object} DOM Element
		 *
		 * @see http://www.liedman.net/leaflet-routing-machine/tutorials/interaction/
		 */
		/*
        function createButton(label, title, className, id, container) {
			let btn = L.DomUtil.create('button', className, container);
			btn.setAttribute('type', 'button');
			btn.setAttribute('title', title);
			if (id) btn.setAttribute('id', id);
			if (label) btn.innerHTML = label;
			return btn;
		};
        */
        /*
		function setParent(el, parent) {
			parent.appendChild(el);
		};
        */
		/*
        function getQueryParams(name) {
			const queryString = window.location.search,
				urlParams = new URLSearchParams(queryString),
				value = urlParams.get(name) || null;

			return value;
		}
        */
		/**
		 * Return array of L.LatLng from query string
		 * 
		 * @return {Array} L.LatLng()
		 */
		/*
        function getQueryLatLngs() {
			let wps = [],
				latlngs = getQueryParams('latlngs');

			if (latlngs) {
				latlngs = latlngs.split("|");
				latlngs.forEach(ll => {
					ll = ll.split(",");
					if (!ll[1]) ll = decodeShortCode(ll[0]);
					wps.push(new L.LatLng(ll[0], ll[1]));
				});
			}

			return wps;
		}
        */
		/**
		 * Return bike profile from url params (profile=)
		 * 
		 * @return {String} profile
		 */
		/*
        function getQueryProfile() {
			let profils = [
					'cycling-road',
					'cycling-regular',
					'cycling-mountain',
					'cycling-electric'
				],
				profil = getQueryParams('profile');

			if (profils.indexOf(profil) !== -1)
				return getQueryParams('profile');
			else
				return null
		}
        */
		/**
		 * Build query string for the url to copy to clipboard
		 * 
		 * @param {Array} wps 
		 * @return {String} query
		 */
		/*
        function buildQueryString(wps) {
			let query = '?latlngs=',
				shortcode = q('input[name=use_shortcode]', formulaire).checked,
				i = 0;

			wps.forEach(wp => {
				let lat = shortcode ? parseFloat(wp.latLng.lat) : wp.latLng.lat.toFixed(4),
					lng = shortcode ? parseFloat(wp.latLng.lng) : wp.latLng.lng.toFixed(4);
				i++;
				query += (shortcode ? makeShortCode(lat, lng, 12) : lat + ',' + lng) + (i < wps.length ? '|' : '');
			});

			// add profil param if not default
			if (osrRouter.options.profile !== 'cycling-road')
				query += '&profile=' + osrRouter.options.profile;

			return query;
		}
        */
		/**
		 * Return an array of L.latLng() from geojson 
		 * If waypoints return waypoints else extract waypoints from trace
		 * 
		 * @param {Object} geojson
		 * @return {Array} wps
		 */
		/*
        function getWps(geojson) {
			let features = geojson.features,
				wps = [],
				linestring = null;

			for (let i = 0; i < features.length; i++) {
				let f = features[i],
					geom = f.geometry,
					type = geom ? geom.type : null;

				if (!type) return wps; // return empty array if no geom

				// extract waypoints and trace
				switch (type) {
					case 'Point':

						let coord = geom.coordinates,
							wp = new L.Routing.Waypoint(getLatLng(coord), f.properties && f.properties.name ? f.properties.name : '');

						L.extend(wp, { properties: f.properties || {} })

						wps.push(wp);

						break;

					case 'LineString':

						linestring = f.geometry;

						if (f.properties && f.properties.name) {
							let input = q('input[name=name]', formulaire);
							input.value = f.properties.name;
							input.dispatchEvent(new Event('change'));
						}

						break;

					default:
						break;
				}
			}

			// If number waypoints less than two and linestring, 
			// extract waypoints from trace (linestring)
			if (linestring && wps.length < 2) {
				wps = [];
				let dist = turf.length(linestring, { unit: 'kilometers' });

				linestring = turf.simplify(
					linestring, {
						tolerance: dist > 100 ? 0.015 : 0.007,
						highQuality: true
					});

				for (let coord of linestring.coordinates) {
					let wp = getLatLng(coord);
					wps.push(wp);
				}
			}

			return wps;
		}
        */
		/**
		 * Return L.latLng from array [lng, lat]
		 * 
		 * @param {Array} coord
		 * @returns L.latLng 
		 */
        /*
        function getLatLng(coord) {
			let lat = parseFloat(coord[1]),
				lng = parseFloat(coord[0]),
				alt = parseFloat(coord[2]) || null;

			return alt ? new L.latLng([lat, lng]) : new L.latLng([lat, lng, alt]);
		}
        */
		/**
		 * Alias
		 * @returns {Ogject} route
		 */
		/*
        function getRoute() {
			return controlRouting.getSelectedRoute();
		}
        */
		/**
		 * 
		 * @param {String} selector 
		 * @param {Object} parent DomElement
		 * 
		 * @returns {Object} DomElement
		 */
		/*
        function q(selector, parent) {
			if (!selector) return;

			parent = parent || document;

			return parent.querySelector(selector)
		}
        */
        /*
		function formChange(e) {
			let target = e.target,
				name = target.name,
				value = target.value,
				opts = osrRouter.options,
				qparam = opts.routingQueryParams,
				qparamopt = opts.routingQueryParams.options,
				route = getRoute(),
				routing = false;

			switch (name) {
				case 'name':
					L.extend(qparam, { 'id': value || 'routing_request' });
					if (route) L.extend(route, { name: value });
					break;

				case 'file_name':

					break;

				case 'file_format':

					break;

				case 'profil':
					L.extend(opts, { 'profile': value });
					plan._selectProfil.value = value;
					routing = plan.isReady();
					break;

				case 'preference':
					L.extend(qparam, { 'preference': value });
					routing = plan.isReady();
					break;

				case 'steepness_difficulty':

					if (!value) {
						if (qparam.options && qparam.options.profile_params)
							delete qparam.options.profile_params
					} else {
						if (!qparamopt) {
							L.extend(qparam, { options: {} });
							qparamopt = qparam.options;
						}
						L.extend(qparamopt, {
							'profile_params': {
								'weightings': {
									'steepness_difficulty': value
								}
							}
						});
					}
					routing = plan.isReady();
					break;

				case 'avoid_features':
					let avoid_features = [],
						elem = formulaire.elements['avoid_features'];

					elem.forEach(el => {
						if (el.checked)
							avoid_features.push(el.value);
					});

					if (avoid_features.length > 0) {
						if (!qparamopt) {
							L.extend(qparam, { options: {} });
							qparamopt = qparam.options;
						}
						L.extend(qparamopt, {
							'avoid_features': avoid_features
						});
					} else {
						if (qparam.options && qparam.options.avoid_features)
							delete qparam.options.avoid_features
					}

					routing = plan.isReady();
					break;

				default:
					break;
			}

			if (qparam.options && !qparam.options.avoid_features && !qparam.options.profile_params)
				delete qparam.options;

			if (routing) controlRouting.route();
		}
        */
        /*
		function createMarker(i, wp, j) {
			let wps = plan.getWaypoints() || wps,
				last = wps.length - 1,
				className = j > wps.length ? '' : i === 0 ? ' marker-start' : i === last ? ' marker-end' : '',
				divIcon = L.divIcon({
					className: 'marker-default' + className,
					iconSize: className ? [20, 20] : [14, 14],
					iconAnchor: className ? [10, 10] : [7, 7],
					html: className ? className === ' marker-start' ? 'A' : 'B' : i,
				}),
				options = {
					draggable: this.draggableWaypoints,
					icon: divIcon,
				},
				marker = L.marker(wp.latLng, options)
				.on('click', L.DomEvent.stop)
				.on('dblclick', function(e) {
					L.DomEvent.stop(e);
					controlRouting.spliceWaypoints(i, 1);
				});
			return marker;
		}
        */
        /*
		function wpGeocoded(e) {
			if (e.waypointIndex === 0 && wps.length <= 1) {
				let ll = e.waypoint.latLng;
				map.setView(ll, 15);
			}
		}
        */
        /*
		function getLayer() {
			return controlRouting.getLine();
		}
        */
        /*
		function uploadTrace() {
			let input = L.DomUtil.create('input');
			input.type = 'file';
			input.accept = '.gpx,.kml,.json,.geojson,application/gpx+xml,application/gpx,application/json,application/vnd.google-earth.kml+xml,application/vnd.google-earth.kml';
			L.DomEvent.on(input, 'change', uploadFile);

			input.click();

			L.DomUtil.remove(input);
		}
        */
		/*
        function uploadFile(e) {
			let file = e.target.files[0],
				name = file.name,
				ext = name.split('.').pop(),
				filename = name.substr(0, name.lastIndexOf('.')) || name,
				reader = new FileReader(),
				input = q('input[name=file_name]', formulaire);

			input.value = filename;
			input.dispatchEvent(new Event('change'));

			reader.readAsText(file);

			reader.onload = L.Util.bind((f) => {
				let data = f.target.result,
					geojson = ['gpx', 'kml'].indexOf(ext) !== -1 ? toGeoJSON[ext](new DOMParser().parseFromString(data, "text/xml")) : JSON.parse(data);

				wps = getWps(geojson);
				plan.setWaypoints(wps);

				controlRouting.once('routeselected', () => {
					fitToLayerBounds();

					// display profile when parcours loaded and route displayed
					if (elevationControl._container.style.display === "none")
						elevationControl.show();
				});
			});
		}
        */
        /*
		function locatePosition() {
			map.locate({ setView: true, maxZoom: 16 });
		}
        */
        /*
		function fitToLayerBounds() {
			if (!getLayer) return;

			let bounds = getLayer().getBounds();
			map.fitBounds(bounds);
		}
        */
        /*
		function exportTrace() {
			let route = getRoute();
			if (route) {
				let coordinates = route.coordinates,
					polyline = L.polyline(coordinates),
					distances = getDistances(coordinates),
					feature = polyline.toGeoJSON(),
					bbox = route.bbox,
					desc = 'Trace exoprté depuis SCASB - Calcul Itinéraire',
					date = new Date(),
					isodate = date.toISOString(),
					name = q('input[name=name]', formulaire).value || 'Itinéraire - ' + isodate,
					filename = q('input[name=file_name]', formulaire).value || 'trace.' + isodate,
					gpx,
					format;

				L.extend(feature, { 'bbox': bbox });

				L.extend(feature.properties, {
					'name': name,
					'desc': desc,
					'date': isodate,
					'author': [{
							'name': 'Openroute Service',
							'email': 'support@openroute@openrouteservice.org',
							'link': 'https://openrouteservice.org/'
						},
						{
							'name': 'SCASB - Calcul Itinéraire vélo',
							'email': 'webmaster@scasb.org',
							'link': 'https://parcours.scasb.org'
						}
					],
					'copyright': {
						'author': 'parcours.scasb.org | openrouteservice.org | OpenStreetMap contributors',
						'year': date.getFullYear(),
						'licence': 'LGPL 3.0',
					},
					'summary': route.summary,
					'instructions': getInstructions(route)
				});

				let f = formulaire.elements['file_format'];
				for (let i = 0; i < f.length; i++) {
					if (f[i].checked) {
						format = f[i].value;
						break;
					}
				}

				let geojson = {
						"type": "FeatureCollection",
						"bbox": bbox,
						"features": [
							feature
						]
					},
					wps;

				if (formulaire.querySelector('input[name=include_waypoints]').checked) {
					wps = plan.getWaypoints();

					for (let i = 0; i < wps.length; i++) {
						let wp = wps[i],
							pow = Math.pow(10, 6),
							lng = Math.round(wp.latLng.lng * pow) / pow,
							lat = Math.round(wp.latLng.lat * pow) / pow,
							id = route.waypointIndices[i],
							distance = distances[id];

						L.extend(wp.properties, {
							"name": wp.name,
							"desc": i === 0 ? 'Start' : i === wps.length - 1 ? 'Finish' : "WP " + i,
							'distance': Math.round(distance * 100) / 100
						})

						geojson.features.push({
							"type": "Feature",
							"geometry": {
								"type": "Point",
								"coordinates": [lng, lat, coordinates[id].alt]
							},
							"properties": wp.properties
						})
					};
				}

				if (format === 'gpx') {

					let author = [],
						metadata = feature.properties,
						bounds = bbox.length > 4 ? bbox.slice(0, 2).concat(bbox.slice(3, 5)) : bbox,
						minlng = bounds[0],
						minlat = bounds[1],
						maxlng = bounds[2],
						maxlat = bounds[3];

					metadata.author.forEach((a) => {
						author.push({
							'name': a.name,
							'email': {
								'@id': a.email.split('@')[0],
								'@domain': a.email.split('@')[1]
							},
							'link': {
								'@href': a.link,
								'text': a.name,
								'type': 'text/html'
							}
						})
					})

					gpx = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
						XML.prettify(
							togpx(geojson, {
								creator: 'scasb.org orpenrouteservice.org togpx',
								metadata: {
									'name': metadata.name,
									'desc': metadata.desc,
									'author': author,
									'copyright': {
										'@author': metadata.copyright.author,
										'year': metadata.copyright.year,
										'licence': metadata.copyright.licence,
									},
									'time': metadata.date,
									'bounds': {
										'@minlat': minlat,
										'@minlon': minlng,
										'@maxlat': maxlat,
										'@maxlon': maxlng
									}
								},
								featureTitle: function(f) {
									return f.name;
								},
								featureDescription: function(f) {
									return f.desc;
								}
							}));
				}
				downloadTrace(gpx || geojson, filename, format);
			}
		}
        */
        /*
		function getDistances(coordinates) {
			let distances = [0];
			for (let i = 1; i < coordinates.length; i++) {
				let from = coordinates[i - 1],
					to = coordinates[i],
					distance = Math.round(from.distanceTo(to) * 10) / 10;

				distances.push(distances[i - 1] + distance);
			}

			return distances;
		}
        */
		/*
        function getInstructions(route) {
			return route.instructions || [];
		}
        */
/*
	});
})(window, L);
// @license-end