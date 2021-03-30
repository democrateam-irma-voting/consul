(function() {
  "use strict";
  App.IrmaVoting = {
    submitVote: function() {
      var getQuestions = function() {
        var questions = {};
        $(".poll-question h3").each(function(){
          var question_id = parseInt($(this).parent().attr("id").split("_")[2]);
          var question_name = $(this).html().trim();
          questions[question_id] = question_name;
        });
        return questions;
      };

      var getAnswers = function() {
        var questions = getQuestions();
        var answers = [];
        $("input").each(function() {
          var input = $(this);
          if (input.prop("checked")) {
            if (input.attr("id").startsWith("answer")) {
              var question_id = parseInt(input.attr("name").split("_")[2]);
              var question = questions[question_id];
              var answer_id = parseInt(input.attr("id").split("_")[1]);
              var answer = input.val();
            }
            answers.push({
              question_id: question_id,
              answer_id: answer_id,
              question: question,
              answer: answer
            });
          }
        });
        return answers;
      };

      var humanReadable = function(answers) {
        var text = "";
        answers.forEach(function(answer) {
          text += answer.question + " " + answer.answer + "\n";
        });
        return text.slice(0, -1);;
      };

      var getVotingNumber = function(result) {
        var voting_number = "";
        result.disclosed[0].forEach(function(attribute) {
          if (attribute.id === "irma-demo.stemmen.stempas.votingnumber") {
            voting_number = attribute.rawvalue;
          }
        });
        return voting_number;
      };

      $("#irma_confirm_voting").on("click", function(event) {
        event.target.disabled = true;
        var election = $("input#poll_slug").val();
        var answers = getAnswers();
        var message = humanReadable(answers);
        var server = "http://192.168.1.38:8090";
        var method = "token";
        var key = "0DLA0eaemnU20XW3YH4";

        if (message === "") {
          message = " "
        }

        var request = {
          "@context": "https://irma.app/ld/request/signature/v2",
          "message": message,
          "disclose": [[[
            { "type": "irma-demo.stemmen.stempas.votingnumber", "notNull": true },
            { "type": "irma-demo.stemmen.stempas.election", "value": election }
          ]]]
        };

        irma.startSession(server, request, method, key).then(function({sessionPtr, token}) {
          var options = {
            server: server,
            token: token
          };
          irma.handleSession(sessionPtr, options).then(function(result) {
            var data = {
              voting_number: getVotingNumber(result),
              vote: JSON.stringify(result)
            };

            if (result.status === "DONE" && result.proofStatus === "VALID"){
              $.ajax({
                type: "POST",
                url: "/polls/" + election + "/irma_vote",
                dataType: "json",
                data: data,
                success: function(message) {
                  window.location.replace("/polls/" + election + "/irma_vote_finalize?" + message.type + "=" + message.text);
                }
              });
            } else {
              window.location.reload();
            }
          }).catch(function(error){
            console.log(error);
            window.location.reload();
          });
        });
      });
    },
    disableAnswers: function() {
      var questions = [];
      var answers = {};
      $("div.irma input").each(function() {
        var question = $(this).attr("name");
        var answer = $(this).attr("id");
        if (answers[question] === undefined) {
          questions.push(question);
          answers[question] = [answer];
        } else {
          answers[question].push(answer);
        }
      });

      $("div.irma input").each(function() {
        $(this).on("change", function(event) {
          var question_id = $(this).attr("name");
          var answer_id = $(this).attr("id");
          var selected_value = $(this).val();
          answers[question_id].forEach(function(answer) {
            if (answer !== answer_id) {
              var input = $("#" + answer);
              input.parent().fadeOut();
            }
          });
          questions.forEach(function(question) {
            if (question_id !== question) {
              answers[question].forEach(function(answer) {
                var input = $("#" + answer);
                if (input.val() === selected_value) {
                  input.attr("disabled", true);
                  input.parent().addClass("irma-answer-disabled");
                }
              });
            }
          });
        });
      });
    },
    clearAnswers: function() {
      var questions = [];
      var answers = {};
      $("div.irma input").each(function() {
        var question = $(this).attr("name");
        var answer = $(this).attr("id");
        if (answers[question] === undefined) {
          questions.push(question);
          answers[question] = [answer];
        } else {
          answers[question].push(answer);
        }
      });

      $("#clear_irma_form").click(function() {
        questions.forEach(function(question) {
          answers[question].forEach(function(answer) {
            var input = $("#" + answer);
            input.attr("disabled", false);
            input.prop("checked", false);
            input.parent().removeClass("irma-answer-disabled");
            input.parent().show();
          });
        });
      });
    },
    initialize: function() {
      App.IrmaVoting.submitVote();
      App.IrmaVoting.disableAnswers();
      App.IrmaVoting.clearAnswers();
    }
  };
}).call(this);
