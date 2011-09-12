class GeoIp
  def self.locate(ip)
    results = CartoDB::Connection.query <<-SQL
      SELECT city, the_geom
      FROM geo_ips
      WHERE ip_start <= inetmi('#{ip.sanitize_sql!}','0.0.0.0')
      ORDER BY ip_start DESC
      LIMIT 1
    SQL

    location = results.rows.first
  end
end
