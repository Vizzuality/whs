module ApplicationHelper
  def paginate(rows, current_page, total_count, per_page = 10)

    total_pages = (total_count.to_f / per_page.to_f).ceil
    pages = (1..total_pages).to_a

    content_tag :div, :class => 'pagination' do
      raw pages.map{|page| link_to page, '#', :class => page == current_page ? 'current' : nil}.join(' ')
    end
  end

  def feature_type
    @feature_type || ''
  end

  def itinerary_time_and_type(itinerary, from)
    return unless itinerary
    "#{distance_of_time_in_words_to_now(itinerary[:time])} by #{itinerary[:type]} from #{from}"
  end
end
