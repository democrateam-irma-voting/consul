class CreatePollIrmaVotes < ActiveRecord::Migration[5.1]
  def change
    create_table :poll_irma_votes do |t|
      t.string :voting_number
      t.text :vote
      t.references :poll, foreign_key: true

      t.timestamps
    end
  end
end
