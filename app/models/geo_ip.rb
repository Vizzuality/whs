class GeoIp
  def self.locate(ip)
    results = CartoDB::Connection.query <<-SQL
      SELECT *
      FROM geo_ips
      WHERE ip_start <= inetmi('#{ip.sanitize_sql!}','0.0.0.0')
      ORDER BY ip_start DESC
    SQL

    location = results.rows.first
  end
end
