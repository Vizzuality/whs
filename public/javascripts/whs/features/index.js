var styles = [[{
        url: '/images/explore/cluster_small.png',
        height: 35,
        width: 35,
        opt_anchor: [16, 0],
        opt_textColor: '#FFFFFF',
        opt_textSize: 18
      }, {
        url: '/images/explore/cluster_med.png',
        height: 48,
        width: 48,
        opt_anchor: [24, 0],
        opt_textColor: '#FFFFFF',
        opt_textSize: 18
      }, {
        url: '/images/explore/cluster_big.png',
        height: 57,
        width: 57,
        opt_anchor: [28, 29],
        opt_textColor: '#FFFFFF',
        opt_textSize: 18
      }]];
var markerClusterer;
var
    form,
    search_url,
    map,
    marker,
    latlng,
    features,
    markers = [],
    search_params = {
      'page': 1
    },
    showSearchLabel = function(){
      var q = $('#q');
      if (!q.val() || q.val() == '') {
        q.prev('label').fadeIn(200);
      };
    },
    addMarkers = function(){
      $.each(features, function(index, feature){
        latlng = new google.maps.LatLng(feature['lat'], feature['lon']);

        var image = new google.maps.MarkerImage("/images/explore/marker_" + feature['type'] + ".png",
              new google.maps.Size(38, 34),
              new google.maps.Point(0,0),
              new google.maps.Point(12, 32));

        marker = new google.maps.Marker({
          // map: map,
          position: latlng,
          title: feature['title'],
          icon: image
        });

        markers.push(marker);
        google.maps.event.addListener(marker, "click", function() {window.location = "/features/" + feature['id']});
      });
    },
    getResults = function(next_page){
      showLoader();
      search_params['page'] = 1;
      if (next_page) {
        search_params['page'] = next_page;
      };
      $.get(search_url, search_params, function(html){
        if (next_page == null) {
          $('#results').empty();
        };
        $('#results').append(html);
        if ($('#results div.mosaic ul li').size()==18 && !$('a#pagination').is(':visible')) {
          $('div#explore div.middle').append('<a href="#more_results" id="pagination">More results</a>');
        } else {
          if ($('#results div.mosaic ul li').size()<18) {
            $('a#pagination').remove();
          }
        }
        hideLoader();
      });
    },
    urlParam = function(url, name){
      var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(url);
      return results[1];
    },
    showLoader = function() {
      $('div.content_box#explore span.loader').fadeIn();
    },
    hideLoader = function() {
      $('div.content_box#explore span.loader').fadeOut();
    };

  $(document).ready( function(){
    form       = $('#ajaxSearch'),
    search_url = form.attr('action');

    showSearchLabel();

    form.submit(function(ev){
      ev.preventDefault();
      $('#searchText').val('');
      search_params['q'] = $('#q').val();
      getResults();
    });

    $('#q').focus(function(){
      $(this).prev('label').fadeOut(200);
    })
    .blur(function(){
      showSearchLabel();
    });

    $("a.type_selector").click(function(ev) {
      ev.stopPropagation();
      ev.preventDefault();
      var classes = $(this).attr('class').split(' ');
      $("a.type_selector").removeClass('selected');
      if ($.inArray('selected', classes) < 0) {
        $(this).addClass('selected');
      };
    });

    $("a#all_selector").click(function(ev){
      $('#type').val('');
    });
    $("a#natural_selector").click(function(ev){
      $('#type').val('');
      if ($(this).hasClass('selected')) {
        $('#type').val('natural');
      };
    });

    $("a#cultural_selector").click(function(ev){
      $('#type').val('');
      if ($(this).hasClass('selected')) {
        $('#type').val('cultural');
      };
    });

    $("a#mosaic_selector").click(function(ev) {
      ev.stopPropagation();
      ev.preventDefault();

      if (!$(this).hasClass('selected')) {
        $("a#mosaic_selector").addClass("selected");
        $("a#list_selector").removeClass("selected");
        $('div#results').addClass('mosaic').removeClass('list');
        $('div#results div.list').fadeOut('fast');
        $('div#results div.mosaic').fadeIn('fast');
      }
    });


    $("a#list_selector").click(function(ev) {
      ev.stopPropagation();
      ev.preventDefault();

      if (!$(this).hasClass('selected')) {
        $("a#mosaic_selector").removeClass("selected");
        $("a#list_selector").addClass("selected");
        $('div#results').removeClass('mosaic').addClass('list');
        $('div#results div.mosaic').fadeOut('fast');
        $('div#results div.list').fadeIn('fast');
      }
    });


    $("a#criteria_label").click(function(ev) {
      ev.stopPropagation();
      ev.preventDefault();
      if ($("div#criteria_select ul").is(":visible")) {
        $("div#criteria_select span").css("backgroundPosition","0 0");
      } else {
        $("div#criteria_select span").css("backgroundPosition","0 -24px");
      }
      $("div#criteria_select ul").toggle();
      $('body').bind('click',function(ev){
        if (!$(ev.target).closest('div#criteria_select').length) {
          $("div#criteria_select span").css("backgroundPosition","0 0");
          $("div#criteria_select ul").hide();
          $('body').unbind('click');
        };
      });
    });

    $("div#criteria_select ul a").click(function(ev) {
      ev.stopPropagation();
      ev.preventDefault();
      $("div#criteria_select span").css("backgroundPosition","0 0");
      $("div#criteria_select ul").toggle();
      if ($(this).text().length>25) {
        var text = $(this).text().substr(0,22) + '...';
      } else {
        var text = $(this).text();
      }

      $("a#criteria_label").text(text);
    });

    $('a.criteria').click(function(ev){
      ev.stopPropagation();
      ev.preventDefault();
      search_params['q'] = $('#q').val();
      search_params['criteria'] = urlParam($(this).attr('href'), 'criteria');
      getResults();
    });

    $("a.type_selector").click(function(ev) {
      search_params['q'] = $('#q').val();
      search_params['type'] = urlParam($(this).attr('href'), 'type');
      getResults();
    });

    $('a#pagination').live('click',function(ev){
      ev.preventDefault();
      getResults(search_params['page'] + 1);
    });

    $("div#map,h1").hover(function(ev) {
      $("h1").stop().fadeTo('200',0,function(){
        $("h1").css('display','none');
      });
    },function(){
      $("h1").css('display','block').stop().fadeTo('200',1);
    });


    $('a#zoomin').click(function(ev){
      ev.preventDefault();
      map.setZoom(map.getZoom() + 1);
    });

    $('a#zoomout').click(function(ev){
      ev.preventDefault();
      map.setZoom(map.getZoom() - 1);
    });



    var myOptions = {
      zoom: 2,
      disableDefaultUI: true,
      center: new google.maps.LatLng(40,10),
      mapTypeId: google.maps.MapTypeId.TERRAIN
    };

    map = new google.maps.Map(document.getElementById("map"), myOptions);

    addMarkers();

    markerClusterer = new MarkerClusterer(map, markers, {
      maxZoom: 18,
      gridSize: 40,
      styles: styles[0]
    });

  });

Array.max = function( array ){
    return Math.max.apply( Math, array );
};
Array.min = function( array ){
    return Math.min.apply( Math, array );
};
