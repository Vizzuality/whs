class ApplicationController < ActionController::Base
  protect_from_forgery

  before_filter :show_setup_wizard_if_uninstalled
  before_filter :geolocate_user

  def features_table_name
    Cartoset::Config['features_table'] || ''
  end

  def show_setup_wizard_if_uninstalled
    redirect_to setup_path unless application_installed? || environment_not_valid?
  end
  private :show_setup_wizard_if_uninstalled

  def application_installed?
    Cartoset::Config.valid?
  end
  private :application_installed?

  def environment_not_valid?
    Rails.env.staging? || Rails.env.production?
  end
  private :environment_not_valid?

  def redirect_back_or_default(default)
    if session[:return_to].nil?
      redirect_to default
    else
      redirect_to session[:return_to]
      session[:return_to] = nil
    end
  end
  private :redirect_back_or_default

  def redirect_back_or_render_action(action)
    if session[:return_to].nil?
      render action
    else
      redirect_to session[:return_to]
      session[:return_to] = nil
    end
  end
  private :redirect_back_or_render_action

  def geolocate_user
  #   if Rails.env.production?
  #     session[:user_location] ||= GeoIp.locate request.remote_ip
  #   else
  #     session[:user_location] = GeoIp.locate '69.31.103.39'
  #   end
  # rescue
    session[:user_location] = {
      "city"         => "Madrid",
      "latitude"     => "40.42221",
      "longitude"    => "-3.6996"
    }
  end
  private :geolocate_user

  def user_latlong
    ::RGeo::Geographic.simple_mercator_factory.point(session[:user_location]['longitude'], session[:user_location]['latitude']) if user_geolocated?
  end
  private :user_latlong

  def user_city
    city = ''
    city = session[:user_location]['city'].capitalize if user_geolocated? && session[:user_location]['city']
    city
  end
  private :user_city

  def user_geolocated?
    session[:user_location] && session[:user_location]['longitude'] && session[:user_location]['latitude']
  end
  private :user_geolocated?

end
