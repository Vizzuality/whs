class HomeController < ApplicationController

  def index
    @user_city         = user_city
    @features = Feature.random(user_latlong)
    @closests_features = Feature.random(user_latlong, true)
  end

end