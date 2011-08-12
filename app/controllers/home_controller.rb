class HomeController < ApplicationController

  def index
    @features = Feature.random
    @closests_features = @features
  end

end