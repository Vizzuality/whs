class FeaturesController < ApplicationController
  include FeatureGetterHelper

  before_filter :get_feature, :only => [:show]

  def index
    @user_city     = user_city
    @features = Feature.search(params, user_latlong)
    @features_json = Feature.all.map{|f| {:lat => f.latitude, :lon => f.longitude, :title => f.title, :id => f.cartodb_id, :type => f.type} }.to_json.html_safe

    render :partial => 'features' if request.xhr?
  end

  def show
    @user_latlong  = user_latlong
    location_point = user_geolocated?? user_latlong : @feature.the_geom
    @user_city     = user_city

    @feature_type   = @feature.type
    @random_feature = Feature.random_one_distinct_from @feature
    @nearest_places = Feature.random(user_latlong, @feature.the_geom, @feature).first(3)

    @feature_json        = {:type => @feature.type, :latitude => @feature.the_geom.y, :longitude => @feature.the_geom.x}.to_json.html_safe
    @nearest_places_json = @nearest_places.map{|f| {:cartodb_id => f.cartodb_id, :type => f.type, :latitude => f.latitude, :longitude => f.longitude, :distance => f.distance} }.to_json.html_safe
    @images_info_json    = Feature.images(@feature).map{|image_data| {:author => image_data.author, :author_url => image_data.author_url } }.to_json.html_safe if Feature.images(@feature).present?

    itinerary       = Feature.itinerary_time_to(@feature, location_point)
    @itinerary_time = itinerary[:time]
    @itinerary_type = itinerary[:type]
    
    @distance = @feature.the_geom.distance(user_latlong)
    puts '###############'
    puts @distance
    puts '###############'
  end

end
