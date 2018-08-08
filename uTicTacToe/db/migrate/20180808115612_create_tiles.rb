class CreateTiles < ActiveRecord::Migration[5.2]
  def change
    create_table :tiles do |t|
      t.integer :owner
      t.references :box

      t.timestamps
    end
  end
end
