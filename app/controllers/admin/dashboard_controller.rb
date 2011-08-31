class Admin::DashboardController < Admin::AdminController

  def index
    @features_columns = Feature.data_columns
    @features         = Feature.first
    @pages            = (Cartoset::Config['pages'] || []).select{|p| p['id'].present? } || []
  end

end