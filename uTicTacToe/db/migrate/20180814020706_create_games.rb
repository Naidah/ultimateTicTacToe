class CreateGames < ActiveRecord::Migration[5.2]
  def change
    create_table :games do |t|
      t.string :board
      t.integer :currPlayer
      t.string :owner
      t.boolean :joinAvailable

      t.timestamps
    end
  end
end
