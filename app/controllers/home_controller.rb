class HomeController < ApplicationController

  def index
    @features = Feature.random(user_latlong)
    @closests_features = Feature.random(user_latlong)
  end

end