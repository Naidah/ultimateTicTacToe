class Game < ApplicationRecord
    has_many :box, :dependent => :destroy
end
