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
let LONGITUDE = 4;
let LINK = 5;
let BACKGROUND = 6;

window.onload = function ()
{
    displayMap();
};


async function displayMap()
{

    let url = "json/google_map_data.json";
    let urlParameters = "";

    try
    {
        const response = await fetch(url,
                {
                    method: "POST",
                    headers: {'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                    body: urlParameters
                });

        updateWebpage(await response.json());
    } catch (error)
    {
        console.log("Fetch failed: ", error);
    }

    function updateWebpage(jsonData)
    {
        for (let i = 0; i < jsonData.length; i++)
        {
            locations.push([jsonData[i].title, jsonData[i].photo, jsonData[i].content, parseFloat(jsonData[i].latitude), parseFloat(jsonData[i].longtitude), jsonData[i].link, jsonData[i].background]);
        }

        map = new google.maps.Map(document.getElementById('mapDiv'),
                {zoom: 6.5,
                    center: new google.maps.LatLng(36.2048, 138.2529),
                    mapTypeId: google.maps.MapTypeId.ROADMAP});
        for (let i = 0; i < locations.length; i++)
        {
            let contentString = '<div id="div_content1" style="background-image:url(' + locations[i][BACKGROUND] + ')"><a href="' + jsonData[i].link + '"><img id="img1" src=' + locations[i][PHOTO] + ' alt=""/></a><div id="div_content2"><h1>' + locations[i][TITLE] + '</h1><p>' + locations[i][CONTENT] + '</p></div></div> ';
            let location_marker = new google.maps.Marker({title: locations[i][TITLE], animation: google.maps.Animation.DROP, position: new google.maps.LatLng(locations[i][LATITUDE], locations[i][LONGITUDE]), map: map});

            google.maps.event.addListener(location_marker, 'click', (function (location_marker, i) //here
            {
                return function ()
                {
                    mapWindow.setContent(contentString);
                    mapWindow.open(map, location_marker);

                    let services_centre = {lat: locations[i][LATITUDE], lng: locations[i][LONGITUDE]};

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

                    service.nearbySearch(
                            {
                                location: services_centre,
                                radius: 100,
                                type: [serviceType]
                            }, getNearbyServicesMarkers);
                };
            })(location_marker, i));
        }
        init();
    }
}
function createMarker(place)
    {
        let icon =
                {
                    url: place.icon, // url
                    scaledSize: new google.maps.Size(30, 30) // scale the image to an icon size
                };
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
            mapWindow.setContent(place.name);
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
        // route planner
        directionsDisplay = new google.maps.DirectionsRenderer();
        directionsDisplay.setMap(map);
        // add directions to the route
        directionsDisplay.setPanel(document.getElementById('directions'));

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
            directionsDisplay.setDirections(response);
        }
    });
}

function showOnMap(id)
{
    map.setZoom(10);
    map.panTo({lat: locations[id][LATITUDE], lng: locations[id][LONGITUDE]});
}


