OpenSSL::SSL::VERIFY_PEER = OpenSSL::SSL::VERIFY_NONE

require 'cartoset/config'
require 'cartoset/constants'
require 'cartoset/features_data_importer'
include Cartoset

Cartoset::Config.setup_cartodb
