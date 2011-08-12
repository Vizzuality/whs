APP_CONFIG = YAML.load_file("#{Rails.root}/config/app_config.yml")[Rails.env].to_options! rescue puts('Error loading app_config.yml')
