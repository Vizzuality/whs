  function MarkerClip(map) {

    this.map = map;

    var theClip = this;

    var markerDiv = document.createElement('div');
    markerDiv.id = map.parent.id + '-markerClip-' + new Date().getTime();
    markerDiv.style.margin = '0';
    markerDiv.style.padding = '0';
    markerDiv.style.position = 'absolute';
    markerDiv.style.top = '0px';
    markerDiv.style.left = '0px';
    markerDiv.style.width = map.dimensions.x+'px';
    markerDiv.style.height = map.dimensions.y+'px';        
    map.parent.appendChild(markerDiv);    

    function onMapChange() {
        theClip.updateMarkers();    
    }

    map.addCallback('drawn', onMapChange);

    map.addCallback('resized', function() {
        markerDiv.style.width = map.dimensions.x+'px';
        markerDiv.style.height = map.dimensions.y+'px';        
        theClip.updateMarkers();
    });

    this.updateMarkers = function() {
        for (var i = 0; i < this.markers.length; i++) {
            this.updateMarkerAt(i);
        }
    };

    this.markers = [];
    this.markerLocations = [];
    this.markerOffsets = [];

    this.addMarker = function(element, location, offset, cartodb_id, kind) {
        element.style.position = 'absolute';
        offset = new MM.Point(offset.x, offset.y);
        markerDiv.appendChild(element);
        console.log(cartodb_id);
        if (cartodb_id!=null) 
          $(element).click(function(ev){window.location = '/features/'+cartodb_id;});
        this.markers.push(element);
        this.markerLocations.push(location);
        this.markerOffsets.push(offset);
        this.updateMarkerAt(this.markers.length-1);
    };

    this.updateMarkerAt = function(index) {
        var point = map.locationPoint(this.markerLocations[index]),
            offset = this.markerOffsets[index],
            element = this.markers[index];
        MM.moveElement(element, { 
          x: point.x - offset.x, 
          y: point.y - offset.y,
          scale: 1, width: 10, height: 10 });
    };

    var createdMarkerCount = 0;

    this.createDefaultMarker = function(type) {
        var marker = document.createElement('div');
        marker.id = map.parent.id+'-marker-'+createdMarkerCount;
        createdMarkerCount++;
        marker.style.width = '25px';
        marker.style.height = '23px';
        marker.style.margin = '0';
        marker.style.padding = '0';
        marker.style.zIndex = 2;
        marker.style.background = "url('/images/marker_" + type + "_mini.png') no-repeat 0 0";
        return marker;
    };
    
    this.createBigMarker = function(type) {
        var marker = document.createElement('div');
        marker.id = map.parent.id+'-marker-'+createdMarkerCount;
        createdMarkerCount++;
        marker.style.width = '38px';
        marker.style.height = '34px';
        marker.style.margin = '0';
        marker.style.padding = '0';
        marker.style.background = "url('/images/explore/marker_" + type + ".png') no-repeat 0 0";
        return marker;
    };
    
    this.createUserMarker = function() {
        var marker = document.createElement('div');
        marker.id = map.parent.id+'-marker-'+createdMarkerCount;
        createdMarkerCount++;
        marker.style.width = '13px';
        marker.style.height = '14px';
        marker.style.margin = '0';
        marker.style.padding = '0';
        marker.style.background = "url('/images/marker_me.png') no-repeat 0 0";
        return marker;
    };   
    
}