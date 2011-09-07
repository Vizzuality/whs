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
      map.setCenter(latlng);
      map.setZoom(5);
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


    // Map customization
    var myOptions = {
      zoom: 8,
      disableDefaultUI: true,
      center: new google.maps.LatLng(feature['latitude'], feature['longitude']),
      mapTypeId: google.maps.MapTypeId.TERRAIN
    };
    map = new google.maps.Map(document.getElementById("big_map"), myOptions);

    // Adding the marker
    var image = new google.maps.MarkerImage("/images/explore/marker_" + feature['type'] + ".png",
          new google.maps.Size(38, 34),
          new google.maps.Point(0,0),
          new google.maps.Point(12, 32));

    latlng = new google.maps.LatLng(feature['latitude'], feature['longitude']);
    var marker = new google.maps.Marker({
      position: latlng,
      map: map,
      title: feature['title'],
      icon: image
    });

    $.each(nearest_places, function(index, place){
      var image = new google.maps.MarkerImage("/images/marker_" + place['type'] + "_mini.png",
            new google.maps.Size(25, 23),
            new google.maps.Point(0,0),
            new google.maps.Point(8, 19));
      marker = new google.maps.Marker({
        position: new google.maps.LatLng(place['latitude'], place['longitude']),
        map: map,
        title: place['title'],
        icon: image
      });

      google.maps.event.addListener(marker, "click", function() { window.location = "/features/" + place['cartodb_id'];  });
      
    });

    google.setOnLoadCallback(drawGeodesicLine);
  }


  function drawGeodesicLine() {
    var poly, geodesic;

    if (userLatLng) {

      var geodesic_points = [latlng,userLatLng];
      var geodesicOptions = {
        path: geodesic_points,
        strokeColor: '#333333',
        strokeOpacity: 1.0,
        strokeWeight: 2,
        geodesic: true
      }
      geodesic = new google.maps.Polyline(geodesicOptions);

      geodesic.setMap(map);

      var image = new google.maps.MarkerImage(
        "/images/marker_me.png",
        new google.maps.Size(13, 14),
        new google.maps.Point(0,0),
        new google.maps.Point(8, 13)
      );

      var marker = new google.maps.Marker({
        position: userLatLng,
        map: map,
        title: "You!",
        icon: image
      });
    }
  }
  
  function travel(){
    // if (map.getBounds().contains(latlng) && map.getBounds().contains(userLatLng)) {
    //   return;
    // };
    
    var geodesicPoints = new Array();
    with (Math) {
      var lat1 = userLatLng.lat() * (PI/180);
      var lon1 = userLatLng.lng() * (PI/180);
      var lat2 = latlng.lat() * (PI/180);
      var lon2 = latlng.lng() * (PI/180);

      var d = 2*asin(sqrt( pow((sin((lat1-lat2)/2)),2) + cos(lat1)*cos(lat2)*pow((sin((lon1-lon2)/2)),2)));

      var steps = distance * 151 / 10015007.480415292;

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
        var p = new google.maps.LatLng(latN/(PI/180), lonN/(PI/180));
        geodesicPoints.push(p);
      }
    }

    google.maps.event.addListener(map, "center_changed", function() { 
      if (geodesicPoints && geodesicPoints.length > 0) {
        setTimeout(function(){
          map.panTo(geodesicPoints.shift());
        }, 50);
      };
    });
    map.setCenter(geodesicPoints.shift());

  }

