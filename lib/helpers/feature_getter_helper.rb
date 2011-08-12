module FeatureGetterHelper

  def get_feature
    results = Feature.find(params[:id]) if params[:id]
    @feature = results.rows.first if results && results.rows.present?
  end
  private :get_feature

end