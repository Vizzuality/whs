class StaticController < ApplicationController
  def about
    @whs_total_count    = Feature.count
    @whs_cultural_count = Feature.count :cultural
    @whs_natural_count  = Feature.count :natural
  end
end
