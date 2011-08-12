var showHeaderSearchLabel = function(){
  var q = $('#searchText');
  if (!q.val() || q.val() == '') {
    q.prev('label').fadeIn(200);
  };
};

$(document).ready(function(){
  showHeaderSearchLabel();

  //FUNCTIONS FOR THE SEARCHBOX BEHAVIOUR
  $('#searchText').focus(function() {
    $(this).prev('label').fadeOut(200);
    $(this).closest('.input_center').animate({
      width: 220
    },200);
  });
  $('#searchText').blur(function() {
    showHeaderSearchLabel();
    $(this).closest('.input_center').animate({
      width: 150
    },200);
  });

  //FUNCTION FOR THE MOSAIC's ELEMENTS
  $('.mosaic_element_div').live({
    mouseover: function() {
      $(this).children(".mosaic_label").show();
    },
    mouseout: function(){
      $(this).children(".mosaic_label").hide();
    }
  });

  // FUNCTION FOR THE BIG IMAGE ON HOME
  $('#big_image').live({
    mouseover: function() {
      $(this).children(".big_label").show();
    },
    mouseout: function(){
      $(this).children(".big_label").hide();
    }
  });

});