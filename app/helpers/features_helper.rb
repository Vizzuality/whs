module FeaturesHelper
  def all_selected?
    css_class = ''
    css_class = 'selected' if params && params[:type].blank?
  end

  def natural_selected?
    css_class = ''
    css_class = 'selected' if params && params[:type] && params[:type].eql?('natural')
  end

  def cultural_selected?
    css_class = ''
    css_class = 'selected' if params && params[:type] && params[:type].eql?('cultural')
  end

  def external link
    link_tag = ''
    if link.present?
      title, url = link.delete('[]').split('|')
      link_tag = link_to title || url, url, :title => title || url
    end
    link_tag
  end
end