class Admin::AdminController < ApplicationController
  before_filter :user_logged?

  layout 'admin'

  def user_logged?
    unless logged_in?
      session[:return_to] = admin_path
      redirect_to cartodb_authorize_path unless logged_in?
    end
  end
  protected :user_logged?
end