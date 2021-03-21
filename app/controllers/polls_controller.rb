class PollsController < ApplicationController
  include FeatureFlags
  include PollsHelper

  feature_flag :polls

  before_action :load_poll, except: [:index]
  before_action :load_active_poll, only: :index

  load_and_authorize_resource

  has_filters %w[current expired]
  has_orders %w[most_voted newest oldest], only: :show

  def index
    @polls = Kaminari.paginate_array(
      @polls.created_by_admin.not_budget.send(@current_filter).includes(:geozones).sort_for_list
    ).page(params[:page])
  end

  def show
    irma_authentication if @poll.irma?
    @questions = @poll.questions.for_render.sort_for_list
    @token = poll_voter_token(@poll, current_user)
    @poll_questions_answers = Poll::Question::Answer.where(question: @poll.questions)
                                                    .where.not(description: "").order(:given_order)

    @answers_by_question_id = {}
    poll_answers = ::Poll::Answer.by_question(@poll.question_ids).by_author(current_user&.id)
    poll_answers.each do |answer|
      @answers_by_question_id[answer.question_id] = answer.answer
    end

    @commentable = @poll
    @comment_tree = CommentTree.new(@commentable, params[:page], @current_order)
  end

  def stats
    @stats = Poll::Stats.new(@poll)
  end

  def results
  end

  def irma_authenticate
  end

  def irma_vote
    vote = @poll.irma_votes.new(irma_vote_params)
    if vote.save
      message = { type: "notice", text: "Your vote has been successfully saved." }
    else
      message = { type: "alert", text: "You have already voted in this poll." }
    end
    render json: message
  end

  def irma_vote_finalize
    if params[:alert]
      @message = { type: :alert, text: params[:alert] }
    elsif params[:notice]
      @message = { type: :notice, text: params[:notice] }
    else
      @message = { type: :alert, text: "An unexpected error has ocurred" }
    end
  end

  private

    def load_poll
      @poll = Poll.find_by_slug_or_id!(params[:id])
    end

    def load_active_poll
      @active_poll = ActivePoll.first
    end

    def irma_authentication
      redirect_to irma_authenticate_poll_path(@poll) unless params[:authenticated].present?
    end

    def irma_vote_params
      params.permit(:voting_number, :vote)
    end
end
