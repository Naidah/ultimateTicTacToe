class CreateGames < ActiveRecord::Migration[5.2]
  def change
    create_table :games do |t|
      t.integer :currPlayer
      t.integer :currBox
      t.integer :lastBox
      t.integer :lastTile

      t.timestamps
    end
  end
end
