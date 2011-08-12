class Feature

  def columns
    []
  end

  class << self

    def find(id)
      CartoDB::Connection.query("SELECT * FROM #{features_table_name} WHERE cartodb_id = #{id}")
    end

    def search(params)

      where = []

      if params && params[:q].present?
        query = params[:q].sanitize_sql!
        where << "title ILIKE '%#{query}%'"
      end

      # Search features by specified type
      where << "type = '#{params[:type]}'" if valid_type?(params)

      # Search features by specified criteria
      where << "criteria ILIKE '%#{params[:criteria]}%'" if valid_criteria?(params)

      where = where.any?? "WHERE #{where.join(' AND ')}" : ''

      query "SELECT * FROM #{features_table_name} #{where}", :page => current_page(params), :rows_per_page => 9
    end

    def valid_type?(params)
      return false if params.blank?
      params && params[:type] && %w(cultural natural).include?(params[:type])
    end

    def valid_criteria?(params)
      return false if params.blank?
      params && params[:criteria] && %w(i ii iii iv v vi vii viii ix x).include?(params[:criteria])
    end

    def current_page(params)
      params[:page] || 1 if params
    end

    def non_common_fields
      columns.reject{|c| Cartoset::Constants::COMMON_FEATURES_FIELDS.include?(c[:name])}
    end

    def random
      query "SELECT cartodb_id, title, images_ids FROM #{features_table_name} ORDER BY RANDOM()", :page => 1, :rows_per_page => 9
    end

    def random_one_distinct_from(feature)
      query "SELECT cartodb_id, title, images_ids FROM #{features_table_name} WHERE cartodb_id <> #{feature.cartodb_id} ORDER BY RANDOM()", :page => 1, :rows_per_page => 1
    end

    def tiny_image_url(image_id)
      "https://s3.amazonaws.com/anotherwhs.com/images/#{image_id}_tiny.jpg"
    end

    def small_image_url(image_id)
      "https://s3.amazonaws.com/anotherwhs.com/images/#{image_id}_small.jpg"
    end

    def large_image_url(image_id)
      "https://s3.amazonaws.com/anotherwhs.com/images/#{image_id}_large.jpg"
    end

    def image_id(feature)
      feature.images_ids.is_a?(String) ? feature.images_ids.split(',').first : feature.images_ids.to_i
    end

    def query(sql, params)
      results = CartoDB::Connection.query sql, params
      return results[:rows] if results && results[:rows]
      results
    end
    private :query

    def features_table_name
      Cartoset::Config['features_table']
    end
    private :features_table_name

    # # By default, removes 'the_geom' from the default select columns
    # def custom_fields
    #   lat_long       = ['ST_Y(the_geom) as lat', 'ST_X(the_geom) as lon']
    #   (columns.map{ |c| c.name } - ['the_geom']).map{ |c| "#{self.table_name}.#{c}" } + lat_long
    # end
    #
    # # Returns all heritage sites with the specified whs site id (must be only one ALWAYS)
    # def by_whs_site_id(id)
    #   scoped.where('meta like ?', "%:whs_site_id: \"#{id}\"%").limit(1).first
    # end
    #
    # # Gets the next feature's images without consolidated images
    # def feature_images(feature_id = nil)
    #   feature = if feature_id
    #     Feature.with_gallery.by_whs_site_id(feature_id)
    #   else
    #     self.with_gallery.without_consolidated_images.sample
    #   end
    #
    #   return nil if feature.nil?
    #
    #   result = nil
    #   if feature
    #
    #     images = feature.gallery.gallery_entries.select{|g| g.image }
    #
    #     if images.present?
    #       result = {
    #         :feature_id => feature.whs_site_id,
    #         :name => feature.title,
    #         :pics => images.map{|gallery| {:pic_id => gallery.id, :url_big => gallery.image.thumbnail(:large).url, :url_small => gallery.image.thumbnail(:small).url}}
    #       }
    #     end
    #   end
    #   result
    # end
    #
    # # Gets a randome feature from database, distinct from the one specified
    # def random_one_distinct_from(feature)
    #   scoped.random.limit(1).where('id != ?', feature.id).first
    # end

    #
    # attr_writer :lat, :lng
    #
    # # Returns all features without consolidated images
    # scope :without_consolidated_images, where('meta not like ?', "%:images_consolidated: true%")
    #
    # # Returns all features with consolidated images
    # scope :with_consolidated_images, where('meta like ?', "%:images_consolidated: true%")
    #
    # # Returns all features with a gallery associated
    # scope :with_gallery, where('gallery_id IS NOT NULL')
    #
    # # Adds a field 'distance' with the calculated distance from feature to specified point
    # scope :with_distance_to, lambda{|point| select("#{custom_fields.join(', ')}, ST_Distance(the_geom::geography, GeomFromText('POINT(#{point.x} #{point.y})', 4326)) as distance") }
    #
    # # Returns features ordered by closest to specified point
    # scope :close_to, lambda{|point| order("ST_Distance(the_geom::geography, GeomFromText('POINT(#{point.x} #{point.y})', 4326))") }
    #
    # # Orders features randomly
    # scope :random, order("RANDOM()")
    #
    # # Adds the geom to the list of selected fields (removed by default to improve performance)
    # scope :with_the_geom, select('the_geom')
    #
    # # Gets all natural features
    # scope :natural, where('meta like ?', "%:type: natural%")
    #
    # # Gets all cultural features
    # scope :cultural, where('meta like ?', "%:type: cultural%")
    #
    # # Filters query by feature criteria
    # scope :by_criteria, lambda{|criteria| where('meta like ?', "%#{criteria}%") }
    #
    # # Filter query search matches in description or meta fields
    # scope :search, lambda{|q| where('description like ? OR meta like ?', "%#{q}%", "%#{q}%")}

  end

    # def consolidate_images(pics_ids)
    #   pics_ids = pics_ids.split(',').map{|id| id.to_i}
    #   images = []
    #   pics_ids.each do |pic_id|
    #     images << [GalleryEntry.find(pic_id).name, GalleryEntry.find(pic_id).image]
    #   end
    #
    #   gallery.gallery_entry_ids = nil
    #   images.each do |image|
    #     gallery.gallery_entries.create! :name => image.first, :image_id => image.last.id
    #   end
    #   meta[:images_consolidated] = true
    #   save!
    # end
    #
    # def distance_to point
    #   distance = 0
    #   results = Feature.select("ST_Distance(the_geom::geography, GeomFromText('POINT(#{point.x} #{point.y})', 4326)) as distance").where(:id => self.id).first
    #   distance = results.distance if results
    #   distance.to_i
    # end
    #
    # def itinerary_time_to(location)
    #   itinerary = {:time => '0 hours'}
    #   itinerary = calculate_itinerary distance_to location if location.present?
    #   itinerary
    # end
    #
    # def distance_in_time
    #   calculate_itinerary(distance.to_f) if distance?
    # end
    #
    # def calculate_itinerary(distance)
    #   itinerary = {}
    #   case
    #   # Distance is less than 500 meters, we're going by walking
    #   when distance < 500
    #     itinerary[:type] = 'walking'
    #     itinerary[:time] = (distance * 1.10 / 5_000).hours.ago
    #   # Distance is between 500 meters and 800 kilometers, we're going by car
    #   when distance >= 500 && distance < 800_000
    #     itinerary[:type] = 'car'
    #     itinerary[:time] = (distance * 1.30 / 120_000).hours.ago
    #   # Distance is greater than 800 kilometers, we're going by plane
    #   when distance >= 800_000
    #     itinerary[:type] = 'plane'
    #     itinerary[:time] = (distance / 700_000).hours.ago
    #   end
    #   itinerary
    # end
    # private :calculate_itinerary
    #
    # # Query google directions to obtain itinerary from location to the feature
    # def query_google_directions(location, mode = 'driving')
    #   require 'net/http'
    #   origin = "#{the_geom.y},#{the_geom.x}"
    #   destination = "#{location.y},#{location.x}"
    #   url = "http://maps.google.com/maps/api/directions/json?mode=#{mode}&origin=#{origin}&destination=#{destination}&sensor=false".gsub(" ", "+")
    #   response = Net::HTTP.get(::URI.parse(url))
    #   directions = JSON.parse(response) if response
    #   directions
    # end
    # private :query_google_directions

    # def lat
    #   self.the_geom? && self.the_geom.y ? self.the_geom.y : @lat
    # end
    # alias latitude lat
    #
    # def lon
    #   self.the_geom? && self.the_geom.x ? self.the_geom.x : @lon
    # end
    # alias longitude lon
    #
    # def to_json
    #   super(:methods => [:lat, :lon])
    # end

end