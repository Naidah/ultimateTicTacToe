class CreateBoxes < ActiveRecord::Migration[5.2]
  def change
    create_table :boxes do |t|
      t.integer :tilesRemaining
      t.integer :owner
      t.references :game

      t.timestamps
    end
  end
end
