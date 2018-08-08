class Box < ApplicationRecord
    has_many :tile, :dependent => :destroy

    belongs_to :game
end
