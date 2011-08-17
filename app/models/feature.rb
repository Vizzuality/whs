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

    def random(location, order_by_distance = false, not_being_feature = nil)
      order = 'ORDER BY RANDOM()'
      order = "ORDER BY ST_Distance(the_geom::geography, GeomFromText('POINT(#{location.x} #{location.y})', 4326))" if order_by_distance
      where = "WHERE cartodb_id <> #{not_being_feature.cartodb_id}" if not_being_feature.present?
      sql = <<-SQL
        SELECT
          cartodb_id,
          title,
          images_ids,
          type,
          ST_X(ST_Transform(the_geom, 4326)) as longitude,
          ST_Y(ST_Transform(the_geom, 4326)) as latitude,
          ST_Distance(the_geom::geography, GeomFromText('POINT(#{location.x} #{location.y})', 4326)) as distance
        FROM #{features_table_name}
        #{where}
        #{order}
        LIMIT 9
      SQL

      query sql
    end

    def random_one_distinct_from(feature)
      randome_one = query <<-SQL
        SELECT cartodb_id, title, images_ids
        FROM #{features_table_name}
        WHERE cartodb_id <> #{feature.cartodb_id}
        ORDER BY RANDOM()
        LIMIT 1
      SQL
      randome_one.first
    end

    def images(feature)
      return [] if feature.images_ids.blank?
      feature[:images] ||= feature.images_ids.split('#').map{|image_data| OpenStruct.new({:id => image_data.split('|').last, :author => image_data.split('|').first, :author_url => image_data.split('|').second})}
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

    def distance_in_time(feature)
      calculate_itinerary(feature.distance.to_f) if feature.distance.present?
    end

    def itinerary_time_to(origin, location)
      itinerary = {:time => '0 hours'}
      itinerary = calculate_itinerary distance_to(origin, location) if location.present?
      itinerary
    end

    def query(sql, params = nil)
      results = CartoDB::Connection.query sql, params
      return results[:rows] if results && results[:rows]
      results
    end
    private :query

    def features_table_name
      Cartoset::Config['features_table']
    end
    private :features_table_name

    def calculate_itinerary(distance)
      itinerary = {}
      case
      # Distance is less than 500 meters, we're going by walking
      when distance < 500
        itinerary[:type] = 'walking'
        itinerary[:time] = (distance * 1.10 / 5_000).hours.ago
      # Distance is between 500 meters and 800 kilometers, we're going by car
      when distance >= 500 && distance < 800_000
        itinerary[:type] = 'car'
        itinerary[:time] = (distance * 1.30 / 120_000).hours.ago
      # Distance is greater than 800 kilometers, we're going by plane
      when distance >= 800_000
        itinerary[:type] = 'plane'
        itinerary[:time] = (distance / 700_000).hours.ago
      end
      itinerary
    end
    private :calculate_itinerary

    def distance_to origin, point
      distance = 0
      results = query <<-SQL
        SELECT
          ST_Distance(the_geom::geography, GeomFromText('POINT(#{point.x} #{point.y})', 4326)) as distance
        FROM #{features_table_name}
        WHERE cartodb_id = #{origin.cartodb_id}
      SQL

      distance = results.first.distance if results.present?
      distance.to_i
    end
    private :distance_to

  end

end