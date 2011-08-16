class ApplicationController < ActionController::Base
  protect_from_forgery

  before_filter :show_setup_wizard_if_uninstalled
  before_filter :geolocate_user

  def features_table_name
    Cartoset::Config['features_table'] || ''
  end

  def show_setup_wizard_if_uninstalled
    redirect_to setup_path unless application_installed?
  end
  private :show_setup_wizard_if_uninstalled

  def application_installed?
    Cartoset::Config.valid?
  end
  private :application_installed?

  def geolocate_user
    if Rails.env.production?
      session[:user_location] = request.location if session[:user_location].blank?
    else
      session[:user_location] = {
        "ip"           => "127.0.0.1",
        "city"         => "Madrid",
        "region_code"  => "28",
        "region_name"  => "Madrid",
        "metrocode"    => "",
        "zipcode"      => "28002",
        "latitude"     => "40.42221",
        "longitude"    => "-3.6996",
        "country_name" => "Spain",
        "country_code" => "SP"
      }
    end
  end
  private :geolocate_user

  def user_latlong
    ::RGeo::Cartesian.simple_factory.point(session[:user_location]['longitude'], session[:user_location]['latitude']) if user_geolocated?
  end
  private :user_latlong

  def user_geolocated?
    session[:user_location] && session[:user_location]['longitude'] && session[:user_location]['latitude']
  end
  private :user_geolocated?

end
