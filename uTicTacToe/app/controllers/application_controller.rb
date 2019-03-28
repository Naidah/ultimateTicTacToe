class ApplicationController < ActionController::API
  def json_response(body, status = :ok)
    render json: body, status: status
  end

  def invalid_parameters
    { error: 'Invalid Parameters' }
  end

  class InvalidParameterError < StandardError
  end
end
