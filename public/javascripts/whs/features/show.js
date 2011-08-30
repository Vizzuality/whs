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
      $("#gallery").fadeIn();
      $('img#default_image').fadeIn();
      $("#photo_credits").fadeIn();
      $("div#img_thumb").hide();
      $("a#show_link").html("Show map");
    } else {
      // Swap big area to map
      map.setCenter(latlng);
      map.setZoom(8);
      $("#gallery").fadeOut();
      $('img#default_image').fadeOut();
      $("#photo_credits").fadeOut();
      $("div#img_thumb").show();
      $("a#show_link").html("Show images");
    }
  });
  setTimeout(function(){loadMap()},500);
});


  function loadMap() {
    $("a#zoomin").fadeIn();
    $("a#zoomin").click(function(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        map.setZoom(map.getZoom()+1);
    });
    $("a#zoomout").fadeIn();
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
    if (google.loader.ClientLocation) {
      var userLatLng = new google.maps.LatLng(google.loader.ClientLocation.latitude, google.loader.ClientLocation.longitude);

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

