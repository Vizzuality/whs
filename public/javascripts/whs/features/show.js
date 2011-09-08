var latlng,map;

$("a#zoomin").hide();
$("a#zoomout").hide();


$(document).ready( function(){
  $("div.map_container").mouseover(function() {
    $("div#darken").show();
    $("a#show_link").show();
  });

  $("div.map_container").mouseout(function() {
    $("div#darken").hide();
    $("a#show_link").hide();
  });

  $("div.map_container div#darken a").click(function(ev) {
    ev.stopPropagation();
    ev.preventDefault();
    if ($("div#img_thumb").is(":visible")) {
      // Swap big area to images
      $("a#zoomin").fadeOut();
      $("a#zoomout").fadeOut();
      $("#gallery").fadeIn();
      $('img#default_image').fadeIn();
      $("#photo_credits").fadeIn();
      $("div#img_thumb").hide();
      $("a#show_link").html("Show map");
    } else {
      // Swap big area to map
      $("a#zoomin").fadeIn();
      $("a#zoomout").fadeIn();
      map.setCenterZoom(latlng, 5);
      $("#gallery").fadeOut();
      $('img#default_image').fadeOut();
      $("#photo_credits").fadeOut();
      $("div#img_thumb").show();
      $("a#show_link").html("Show images");
      travel();
    }
  });
  loadMap();
});


  function loadMap() {

    $("a#zoomin").click(function(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        map.setZoom(map.getZoom()+1);
    });
    $("a#zoomout").click(function(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        map.setZoom(map.getZoom()-1);
    });


    var tilejson = {
       tilejson: '1.0.0',
       scheme: 'tms',
       tiles: ['http://a.tiles.mapbox.com/mapbox/1.0.0/blue-marble-topo-bathy-jul/{z}/{x}/{y}.png']
     };
    

    map = new MM.Map('big_map',new wax.mm.connector(tilejson));
    latlng = new MM.Location(feature['latitude'], feature['longitude']);
    map.setCenterZoom(latlng, 2);

 
    // Clip for adding the markers
    markerClip = new MarkerClip(map);

    // Near markers
    $.each(nearest_places, function(index, place){
      
      var marker = markerClip.createDefaultMarker(place['type']),
          location = new MM.Location(place['latitude'], place['longitude']);
      marker.title = location.toString();
      markerClip.addMarker(marker, location, {x:8,y:19},place['cartodb_id']);
    });
    
    
    // Add big marker
    var marker = markerClip.createBigMarker(feature['type']),
        location = new MM.Location(feature['latitude'], feature['longitude']);
    marker.title = location.toString();
    markerClip.addMarker(marker, location, {x:12,y:32}, feature['cartodb_id']);
  
    if (userLatLng) {
      drawGeodesicLine();
    }
  }



  function drawGeodesicLine() {
    var canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.left = '0px';
    canvas.style.top = '0px';
    canvas.width = map.dimensions.x;
    canvas.height = map.dimensions.y;
    map.parent.appendChild(canvas);

    var locations = [];
    for (var i = 0; i <= 100; i++) {
      var f = i/100.0;
      locations.push(com.modestmaps.Location.interpolate(latlng,userLatLng, f));
    }
    map.setExtent(locations);

    function redraw() {
      var ctx = canvas.getContext('2d');
      ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.strokeStyle = 'black';
      ctx.beginPath();
      var p = map.locationPoint(locations[0]);
      ctx.moveTo(p.x,p.y);
      for (var i = 1; i < locations.length; i++) {
        p = map.locationPoint(locations[i]);
        ctx.lineTo(p.x,p.y);
      }
      ctx.stroke();
    }

    map.addCallback('drawn', redraw);
    map.addCallback('resized', function() {
      canvas.width = map.dimensions.x;
      canvas.height = map.dimensions.y;
      redraw();
    });

    redraw();
    
    var marker = markerClip.createUserMarker();
    marker.title = location.toString();
    markerClip.addMarker(marker, userLatLng, {x:8,y:13});
  }
  
  

  function travel(){
    
    var geodesicPoints = new Array();
    with (Math) {
      var lat1 = userLatLng.lat * (PI/180);
      var lon1 = userLatLng.lon * (PI/180);
      var lat2 = latlng.lat * (PI/180);
      var lon2 = latlng.lon * (PI/180);
  
      var d = 2*asin(sqrt( pow((sin((lat1-lat2)/2)),2) + cos(lat1)*cos(lat2)*pow((sin((lon1-lon2)/2)),2)));
  
      var steps = distance * 300 / 10015007.480415292;
      // steps = 300;
  
      for (var n = 0 ; n < steps ; n++ ) {
        var f = (1/(steps - 1)) * n;
        // f = f.toFixed(6);
        var A = sin((1-f)*d)/sin(d)
        var B = sin(f*d)/sin(d)
        var x = A*cos(lat1)*cos(lon1) +  B*cos(lat2)*cos(lon2)
        var y = A*cos(lat1)*sin(lon1) +  B*cos(lat2)*sin(lon2)
        var z = A*sin(lat1)           +  B*sin(lat2)
  
        var latN = atan2(z,sqrt(pow(x,2)+pow(y,2)))
        var lonN = atan2(y,x)
        var p = new MM.Location(latN/(PI/180), lonN/(PI/180));
        geodesicPoints.push(p);
      }
    }
      
    function paannn() {
      if (geodesicPoints && geodesicPoints.length > 0) {
        map.setCenterZoom(geodesicPoints.shift(),6);
      } else {
        clearInterval(interval);
      }
    }
    
    var interval = setInterval(function(){paannn()},20);
    map.setCenterZoom(geodesicPoints.shift(),6);
  
  }
