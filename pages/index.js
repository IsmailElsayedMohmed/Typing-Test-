import React, { useCallback, useEffect, useRef, useState } from 'react'
import randomParagraphs from '../randomParagraph.json'
const generatingRandomParagraph = () => {
  const { paragraphs } = randomParagraphs
  const random = Math.floor(paragraphs.length * Math.random())
  return paragraphs[random] + paragraphs[random + 1]
}
const Word = React.memo(({ word, correct, value, border }) => {
  const arrowTracker = useRef()

  const check = () => {
    if (correct === true) {
      return 'bg-[#edf7e7] text-[#95c590]  shadow-teal-200'
    }
    if (correct === false) {
      return 'text-rose-900  bg-rose-200  shadow-rose-200'
    }
  }
  return (
    <span
      ref={arrowTracker}
      data-wrong={value}
      className={` mr-[2px] rounded-sm    text-center ${
        border &&
        'text-[#3295db] underline decoration-[#3295db] decoration-4 underline-offset-[10px]'
      } leading-[2] ${check()}  `}
    >
      {word}
    </span>
  )
})
const Timer = ({ startCounting, setFinished, correctWord }) => {
  const [timer, setTimer] = useState(60)
  useEffect(() => {
    let time
    if (startCounting) {
      time = setInterval(() => {
        setTimer((e) => e - 1)
      }, 1000)
    }
    return () => {
      clearInterval(time)
      setTimer(60)
    }
  }, [startCounting])
  useEffect(() => {
    if (timer === 0) {
      setFinished(true)
    }
  }, [timer])
  return (
    <div className=" flex justify-evenly font-bold">
      <div>Timer: {timer}s</div>
      <div>WPM: {correctWord.filter((e) => e.value === ' ').length}</div>
    </div>
  )
}
const Finished = ({ correctWord, changeItAll }) => {
  const letterPerMin = correctWord.filter((e) => e.value === ' ').length
  const mistakes = correctWord.filter((e) => !e.state).length
  return (
    <div className="flex-center fixed top-0 left-0 z-10 h-screen w-screen bg-gray-100">
      <div className="w-[1100px] space-y-4 rounded-lg bg-white p-4 py-8 text-2xl font-bold  ">
        <h1 className="bg-gray-100 text-gray-800">
          Time's up you achieved During 1 min Typing test{' '}
        </h1>
        <div className="flex w-full items-center justify-between   gap-2 py-4 text-gray-700">
          <div className="flex-1 rounded-lg border-2 border-red-400 p-2 text-center shadow-md  shadow-red-400">
            <h1>Mistakes</h1>
            <span className="text-red-600">{mistakes}</span>
          </div>

          <div className="flex-1 rounded-lg border-2 border-teal-400 p-2 text-center shadow-md  shadow-teal-400">
            <h1>WPM</h1>
            <span className="text-teal-600">{letterPerMin}</span>
          </div>

          <div className="flex-1 rounded-lg border-2 border-emerald-400 p-2 text-center shadow-md  shadow-emerald-400">
            <h1>CPM</h1>
            <span className="text-emerald-600">{correctWord.length}</span>
          </div>
        </div>
        <button
          onClick={changeItAll}
          className="rounded-lg border-2 border-gray-500 bg-gray-100 py-2 px-6 shadow-md shadow-gray-400 hover:bg-gray-400 hover:text-white"
        >
          Play Again
        </button>
      </div>
    </div>
  )
}
function TypingTestCodedamn() {
  const [inputValue, setInputValue] = useState('')
  const [randomParagraph, setRandomParagraph] = useState([])
  const [finished, setFinished] = useState(false)
  const inputDiv = useRef(null)
  useEffect(() => {
    inputDiv.current?.focus()
    setRandomParagraph(generatingRandomParagraph().split(''))
  }, [finished])
  const [correctWord, setCorrectWord] = useState([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [startCounting, setStartCounting] = useState(false)
  const [audio, setAudio] = useState({ value: '' })
  const [transition, setTransition] = useState(0)
  const parentWords = useRef(null)
  const onChange = (value) => {
    if (value.length === 1) new Audio(`/start.mp3`).play()
    if (value.length === randomParagraph.length) {
      setRandomParagraph((e) => [
        ...e,
        ' ',
        ...generatingRandomParagraph().split(''),
      ])
      return
    }
    setStartCounting(true)
    const moveDwonFn = (forwardOrDown) => {
      const activeElement = parentWords.current.children[activeIndex]
      const moveDown =
        activeElement.nextElementSibling.offsetTop !== activeElement.offsetTop
      moveDown && setTransition((e) => e + forwardOrDown)
    }

    const lastValue = value[value.length - 1]
    if (value.length < correctWord.length) {
      moveDwonFn(-1)
      setCorrectWord((e) => e.slice(0, value.length - correctWord.length))
      setActiveIndex((e) => e - (correctWord.length - value.length))
      setInputValue(value)
      return
    } else {
      setInputValue(value)
      if (lastValue === randomParagraph[activeIndex]) {
        new Audio(`/success.wav`).play()
        moveDwonFn(1)
        setAudio({ value: 'success' })
        setCorrectWord((e) => [...e, { value: lastValue, state: true }])
      } else {
        new Audio(`/faild.wav`).play()
        setAudio({ value: 'faild' })
        setCorrectWord((e) => [...e, { value: lastValue, state: false }])
      }
      setActiveIndex((e) => e + 1)
    }
  }
  const changeItAll = () => {
    setCorrectWord([])
    setActiveIndex(0)
    setStartCounting(false)
    setTransition(0)
    setFinished(false)
    setInputValue('')
  }
  if (finished) {
    return (
      <Finished
        setFinished={setFinished}
        changeItAll={changeItAll}
        correctWord={correctWord}
      />
    )
  }
  return (
    <>
      <div
        onClick={() => inputDiv.current.focus()}
        className="container2 mt-12 p-8"
      >
        <div className="min-h-[80vh] rounded-lg bg-gray-100">
          <h1 className="pt-4 text-center text-2xl underline decoration-teal-200 underline-offset-8">
            Typing test
          </h1>
          <div className="mx-auto mt-12 mb-24 w-[60%] space-y-4">
            <Timer
              startCounting={startCounting}
              setFinished={setFinished}
              correctWord={correctWord}
            />
            <div className="h-[400px] overflow-hidden rounded-2xl bg-white p-4 font-serif text-2xl  text-gray-500 shadow-sm shadow-cyan-200 ">
              <div
                style={{
                  transform: `translateY(${transition * -48}px)`,
                }}
                className="transition-transform duration-1000 "
                ref={parentWords}
              >
                {randomParagraph.map((word, index) => (
                  <Word
                    key={index}
                    word={word}
                    correct={correctWord[index]?.state}
                    value={correctWord[index]?.value}
                    border={correctWord.length === index}
                  />
                ))}
              </div>
            </div>
            <div className="absolute top-0 left-0 h-[200px] rounded-2xl bg-white font-serif font-bold text-gray-800 opacity-0  shadow-sm shadow-cyan-200 ">
              <input
                ref={inputDiv}
                value={inputValue}
                className="pointer-events-none h-full w-full resize-none  rounded-2xl p-4   focus:outline-none"
                onChange={(e) => {
                  return onChange(e.target.value)
                }}
              ></input>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default TypingTestCodedamn
