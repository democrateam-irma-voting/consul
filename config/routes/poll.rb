resources :polls, only: [:show, :index] do
  member do
    get :stats
    get :results
    get :irma_authenticate
    post :irma_vote
    get :irma_vote_finalize
  end

  resources :questions, controller: "polls/questions", shallow: true do
    post :answer, on: :member
  end
end

resolve "Poll::Question" do |question, options|
  [:question, options.merge(id: question)]
end
