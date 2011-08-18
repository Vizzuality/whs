class HomeController < ApplicationController

  def index
    @user_city         = user_city
    @features = Feature.random(user_latlong).first(7)
    @closests_features = Feature.random(user_latlong, true).first(9)
  end

end