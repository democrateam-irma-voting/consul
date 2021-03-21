class Poll::IrmaVote < ApplicationRecord
  belongs_to :poll

  validates :voting_number, uniqueness: { scope: :poll }
end
