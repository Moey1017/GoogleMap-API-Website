//"use strict";
let map = null;
let directionsDisplay = null;
let directionsService = null;
let mapWindow = new google.maps.InfoWindow();
let nearbyServicesMarkers = []; // used in both getNearbyServicesMarkers() and createMarker()

let locations = [];
let TITLE = 0;
let PHOTO = 1;
let CONTENT = 2;
let LATITUDE = 3;
let LONGTITUDE = 4;
let LINK = 5;
let BACKGROUND = 6;
let ICON = 7;



window.onload = function ()
{
    displayMap();
};


async function displayMap()
{

    fetch("json/google_map_data.json").then(function (resp) {
        return resp.json();
    })
            .then(function (data) {
                updateWebpage(data);
            });


    function updateWebpage(jsonData)
    {
        for (let i = 0; i < jsonData.length; i++)
        {
            locations.push([jsonData[i].title, jsonData[i].photo, jsonData[i].content, parseFloat(jsonData[i].latitude), parseFloat(jsonData[i].longtitude), jsonData[i].link, jsonData[i].background, jsonData[i].icon]);
        }


        
        map = new google.maps.Map(document.getElementById('mapDiv'),
                {zoom: 6.5,
                    center: new google.maps.LatLng(36.2048, 138.2529),
                    mapTypeId: google.maps.MapTypeId.ROADMAP});
        for (let i = 0; i < locations.length; i++)
        {
            icon = {
            url: locations[i][ICON],
            scaledSize: new google.maps.Size(50, 50) // scaled size
        };
        
            let contentString = '<div id="div_content1" style="background-image:url(' + locations[i][BACKGROUND] + ')"><button id="start" onclick="startSearch(' + i + ')">Start</button><button id="end" onclick="endSearch(' + i + ')">End</button><a href="' + jsonData[i].link + '"><img id="img1" src=' + locations[i][PHOTO] + ' alt=""/></a><div id="div_content2"><h1>' + locations[i][TITLE] + '</h1><p>' + locations[i][CONTENT] + '</p></div></div> ';
            let location_marker = new google.maps.Marker({title: locations[i][TITLE], animation: google.maps.Animation.DROP, position: new google.maps.LatLng(locations[i][LATITUDE], locations[i][LONGTITUDE]), map: map, icon: icon});

            google.maps.event.addListener(location_marker, 'click', (function (location_marker, i) //here
            {
                return function ()
                {
                    if (status === google.maps.places.PlacesServiceStatus.OK)
                    {
                        for (let i = 0; i < location_marker.length; i++)
                        {
                            createMarker(location_marker[i]);
                        }
                    }
                    // hide any previously displayed services markers
                    if (nearbyServicesMarkers.length > 0)
                    {
                        for (let i = 0; i < nearbyServicesMarkers.length; i++)
                        {
                            nearbyServicesMarkers[i].setVisible(false);
                        }
                    }
                    // empty nearbyServicesMarkers[], so that it can be used to hold the nearby services markers for the currently clicked marker
                    nearbyServicesMarkers = [];

                    showOnMap(i, 10);
                    mapWindow.setContent(contentString);
                    mapWindow.open(map, location_marker);

                    let services_centre = {lat: locations[i][LATITUDE], lng: locations[i][LONGTITUDE]};

                    let service = new google.maps.places.PlacesService(map);

                    let serviceType = "";
                    if (document.getElementById('shopping_mall').checked === true)
                    {
                        serviceType = "shopping_mall";
                    }
                    if (document.getElementById('tourist_attraction').checked === true)
                    {
                        serviceType = "tourist_attraction";
                    }
                    if (document.getElementById('hotel').checked === true)
                    {
                        serviceType = "lodging";
                    }

                    for (let i = 0; i < 6; i++)
                    {
                        setTimeout(function () {
                            service.nearbySearch(
                                    {
                                        location: services_centre,
                                        radius: 1000 * i,
                                        type: [serviceType]
                                    }, getNearbyServicesMarkers);
                        }, 500);
                    }
                };
            })(location_marker, i));
        }
        init();
        var flightPlanCoordinates = [
            {lat: 53.997954, lng: -6.405608},
            {lat: 55.478645, lng: 43.239456},
            {lat: 51.238537, lng: 68.722565},
            {lat: 43.393974, lng: 105.030781},
            {lat: 35.674731, lng: 139.715290}
        ];
        var flightPath = new google.maps.Polyline({
            path: flightPlanCoordinates,
            geodesic: true,
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 2,
        });

        flightPath.setMap(map);
    }
}



function createMarker(place)
{
    let icon;
    if (document.getElementById('shopping_mall').checked === true)
    {
        icon = {
            url: "https://cdn3.iconfinder.com/data/icons/shopping-207/49/102-512.png",
            scaledSize: new google.maps.Size(30, 30), // scaled size
        };
    } else if (document.getElementById('tourist_attraction').checked === true)
    {
        icon = {
            url: "https://cdn4.iconfinder.com/data/icons/country-landmarks-and-destinations/91/Vietnam-512.png", // url
            scaledSize: new google.maps.Size(40, 40), // scaled size
        };
    } else if (document.getElementById('hotel').checked === true)
    {
        icon = {
            url: "https://cdn2.iconfinder.com/data/icons/travel-caramel-vol-1/256/5_STARS_HOTEL-512.png", // url
            scaledSize: new google.maps.Size(40, 40), // scaled size
        };
    } else
    {
        icon = {
            url: place.icon,
            scaledSize: new google.maps.Size(30, 30), // scaled size
        };
    }
    let marker = new google.maps.Marker(
            {
                map: map,
                position: place.geometry.location,
                icon: icon
            });

    // add the marker to nearbyServicesMarkers[]       
    nearbyServicesMarkers.push(marker);

    google.maps.event.addListener(marker, 'click', function ()
    {
        let pic = "<img src='" + place.photos[0].getUrl() + "'width='180' height='100'>";
        let contentString = "<div id='div_content3'><button onclick='startSearch2(\"" + place.geometry.location.toString().substring(1, place.geometry.location.toString().length - 1) + "\")'>Start</button><button onclick='endSearch2(\"" + place.geometry.location.toString().substring(1, place.geometry.location.toString().length - 1) + "\")'>End</button><br>" + place.name + "</strong><br>Address : " + place.vicinity + "</br><div id='div_content3_img'>" + pic + "</div></div>";

        showOnMap2(place.geometry.location, 15);
        mapWindow.setContent(contentString);
        mapWindow.open(map, this);
    });
}

function getNearbyServicesMarkers(results, status)
{
    if (status === google.maps.places.PlacesServiceStatus.OK)
    {
        // hide any previously displayed services markers
        if (nearbyServicesMarkers.length > 0)
        {
            for (let i = 0; i < nearbyServicesMarkers.length; i++)
            {
                nearbyServicesMarkers[i].setVisible(false);
            }
        }
        // empty nearbyServicesMarkers[], so that it can be used to hold the nearby services markers for the currently clicked marker
        nearbyServicesMarkers = [];

        for (let i = 0; i < results.length; i++)
        {
            createMarker(results[i]);
        }
    }
}
function init()
{
    let start = document.getElementById('start');
    let end = document.getElementById('end');
    new google.maps.places.Autocomplete(start);
    new google.maps.places.Autocomplete(end);

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer(
            {
                draggable: true
            });

    directionsRenderer.setMap(map);
    directionsRenderer.setPanel(document.getElementById('directions'));

}

//swapStartwithEnd
function swapStartEnd()
{

    let hold = document.getElementById('start').value;
    document.getElementById('start').value = document.getElementById('end').value;
    document.getElementById('end').value = hold;
}

//Reset Start and End 
function resetStartEnd()
{
    document.getElementById('start').value = "";
    document.getElementById('end').value = "";
}

//calculate route 
function calculateRoute()
{
    let start = document.getElementById('start').value;
    let end = document.getElementById('end').value;

    let request = {origin: start,
        destination: end,
        travelMode: google.maps.TravelMode[travel]};

    directionsService.route(request, function (response, status)
    {
        if (status === google.maps.DirectionsStatus.OK)
        {
            directionsRenderer.setDirections(response);
        }
    });
}

function showOnMap(id, size)
{
    map.setZoom(size);
    map.panTo({lat: locations[id][LATITUDE], lng: locations[id][LONGTITUDE]});
}

function showOnMap2(place, size)
{
    map.setZoom(size);
    map.panTo(place);
}

function startSearch(i)
{
    document.getElementById('start').value = locations[i][LATITUDE] + ", " + locations[i][LONGTITUDE];
}

function endSearch(i)
{
    document.getElementById('end').value = locations[i][LATITUDE] + ", " + locations[i][LONGTITUDE];
}

function startSearch2(location)
{
    document.getElementById('start').value = location;
}

function endSearch2(location)
{
    document.getElementById('end').value = location;
}
