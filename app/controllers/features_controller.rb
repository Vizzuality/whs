class FeaturesController < ApplicationController
  include FeatureGetterHelper

  before_filter :get_feature, :only => [:show]

  def index
    @features = Feature.search(params)

    render :partial => 'features' if request.xhr?
  end

  def show
    # location_point  = user_geolocated?? user_latlong : @feature.the_geom
    @user_city      = 'Madrid' #user_city

    @feature_type   = @feature.type
    @random_feature = Feature.random_one_distinct_from @feature
    @nearest_places = []#Feature.with_distance_to(location_point).close_to(@feature.the_geom).where('id != ?', @feature.id).limit(3)

    # itinerary       = @feature.itinerary_time_to location_point
    # @itinerary_time = itinerary[:time]
    # @itinerary_type = itinerary[:type]

  end

end
