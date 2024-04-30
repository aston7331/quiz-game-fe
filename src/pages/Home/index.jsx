import React, { useEffect, useState } from 'react';
import { getQuestion, getScore, submitAnswer, clearDatabase, addUser } from '../../services/user.service';
import style from "./home.module.scss";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Home = () => {
  const [name, setname] = useState('');
  const [quizStarted, setQuizStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [score, setScore] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timer, setTimer] = useState(10);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [quizEnded, setQuizEnded] = useState(false);
  const [isOptionSelected, setIsOptionSelected] = useState(null);

  const fetchQuestions = async () => {
    try {
      const response = await getQuestion();
      setQuestions(response?.data || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };


  const fetchScores = async () => {
    try {
      const response = await getScore();

      setScore(response?.data || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const clearData = async () => {
    try {
      await clearDatabase();
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const countdown = () => {
    if (timer > 0) {
      setTimer(timer - 1);
    } else {
      setShowCorrectAnswer(true);
      setSelectedOption(null);
      setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setTimer(10);
          setShowCorrectAnswer(false);
        } else {
          setQuizEnded(true);
          setTimer(0);
          fetchScores();
        }
      }, 4000);
    }
  };

  const handleSubmitName = async (e) => {
    e.preventDefault();
    const response = await addUser(name);
    if (response.success) {
      setQuizStarted(true);
      setTimer(10);
      localStorage.setItem("name", JSON.stringify(response.data?.user))
      console.log('User added successfully:', response.data?.user);
      fetchQuestions();
    } else {
      toast(response?.error.detail)
      console.error('Error adding user:', response?.data);
    }
  };

  useEffect(() => {
    if (quizStarted) {
      fetchQuestions();
    }
  }, [quizStarted]);

  useEffect(() => {
    let timerId;

    if (!quizEnded) {
      timerId = setInterval(countdown, 1000);
    }

    return () => clearInterval(timerId);
  }, [timer, quizEnded]);

  // useEffect(() => {
  //   fetchQuestions();
  // }, []);


  const handleOptionSelect = async (option) => {
    setSelectedOption(option);
    setIsOptionSelected(true);
    const userAnswer = {
      question_id: questions[currentQuestionIndex].id,
      user_answer: option,
      username: JSON.parse(localStorage.getItem('name'))
    };
    try {
      const response = await submitAnswer(userAnswer);
      if (response.success) {
        console.log('Answer submitted successfully:', response.data);
      } else {
        console.error('Error submitting answer:', response.error);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };


  const restartQuiz = () => {
    setQuestions([]);
    setScore([]);
    setCurrentQuestionIndex(0);
    setTimer(10);
    setSelectedOption(null);
    setShowCorrectAnswer(false);
    setQuizEnded(false);
    fetchQuestions();
    clearData()
  };

  return (
    <div className={style.Main}>
      <ToastContainer />
      {!quizStarted ? (
        <div>
          <h2>Enter your name to start the quiz</h2>
          <form onSubmit={handleSubmitName}>
            <input className={style.nameBody} type="text" value={name} onChange={(e) => setname(e.target.value)} />
            <button className={style.nameButton} type="submit">Start Quiz</button>
          </form>
        </div>
      ) : (
        <div>
          {!quizEnded && questions.length > 0 ? (
            <div key={questions[currentQuestionIndex].id} className={style.Header}>
              <div className={style.MainBody}>
                <h3 className="text-lg mb-4">Q.{questions[currentQuestionIndex].id} {questions[currentQuestionIndex].question}</h3>
              </div>
              <ul className={style.UlList}>
                {questions[currentQuestionIndex].distractors.map((distractor, optionIndex) => (
                  <li key={optionIndex} className={style.list}>
                    <button
                      onClick={() => handleOptionSelect(distractor)}
                      className={`${style.Input} ${selectedOption === distractor ? style.selected : ''} ${showCorrectAnswer && distractor === questions[currentQuestionIndex].answer ? style.correct : ''} ${showCorrectAnswer && selectedOption === distractor && distractor !== questions[currentQuestionIndex].answer ? style.incorrect : ''} ${selectedOption !== null ? 'disabled' : ''}`}
                      disabled={showCorrectAnswer || selectedOption !== null}
                    >
                      {distractor}
                    </button>
                  </li>
                ))}
              </ul>
              {showCorrectAnswer && (
                <p className="text-red-500">Correct Answer: {questions[currentQuestionIndex].answer}</p>
              )}
            </div>
          ) : (
            <div>
              <p>Quiz has ended. Thank you for participating!</p>
              <p>Your score: {score?.score}</p>
              {/* <button onClick={restartQuiz} className={style.restartButton}>
                Restart Quiz
              </button> */}
            </div>
          )}
          <p>Time left: {timer} seconds</p>
        </div>
      )}
    </div>
  );
};

export default Home;
