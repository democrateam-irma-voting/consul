class AddIrmaToPolls < ActiveRecord::Migration[5.1]
  def change
    add_column :polls, :irma, :boolean, default: false
  end
end
