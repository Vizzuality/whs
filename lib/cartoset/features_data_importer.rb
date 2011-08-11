class Cartoset::FeaturesDataImporter

  DATA_FILE_PATH = Rails.root.join('tmp/features_data.csv').freeze

  def self.start(data_stream)
    table = {}
    File.open(DATA_FILE_PATH, 'w+') do |file|
      file.write(data_stream.read.force_encoding("UTF-8"))

      @tables = CartoDB::Connection.tables || nil
      CartoDB::Connection.drop_table('cartoset_features') if @tables && @tables.map{|t| t.name}.include?('cartoset_features')

      table = CartoDB::Connection.create_table 'cartoset_features', file
    end

    table
  end
end