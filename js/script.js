let canvas
let ctx
let gameLoop
let currentGameState
let score = 0
let scoreEl = document.getElementById('score')
// let level1 = [
//   [0, 1, 0, 1, 0, 1, 0, 1]
//   [1, 1, 1, 0, 1, 1, 1, 0],
//   [1, 1, 1, 1, 1, 1, 1, 1],
//   [1, 1, 1, 1, 1, 1, 1, 1],
//   [1, 1, 1, 1, 1, 1, 1, 1],
//   [1, 1, 1, 1, 1, 1, 1, 1],
// ]

// let level1 = [
//   [0, 1],
//   [1, 0]
// ]

// let level1 = [0]

let level1 = [0, 1, 0, 1, 0, 1, 0, 1]

let generatedBricks = []
let displayedBricks = []
let ball = {
  size: 15,
  x: 220,
  y: 400,
  speed: 5,
  colour: 'red',
  directionX: -1,
  directionY: 1
}

let paddle = {
  width: 200,
  height: 30,
  x: 0,
  y: 550,
  speed: 25,
  colour: 'blue',
  direction: -1
}

let game = {
  width: 800,
  height: 600
}

let gameStates = {
  menu: 0,
  running: 1,
  paused: 2,
  gameOver: 3,
  victory: 4
}

const displayBall = () => {
  // ! changed circle generation to a box with an image of a circle
  // ctx.beginPath()
  // ctx.arc(ball.x, ball.y, ball.size, 0, 2 * Math.PI)
  // ctx.fillStyle = ball.colour
  // ctx.fill()
  ctx.fillStyle = ball.colour
  ctx.fillRect(ball.x, ball.y, ball.size, ball.size)
  ball.x += ball.speed * ball.directionX
  ball.y += ball.speed * ball.directionY
}

const displayPaddle = () => {
  ctx.fillStyle = paddle.colour
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height)
}

const generateBricks = () => {
  for (let i = 0; i < level1.length; i++) {
    let brick
    switch (level1[i]) {
      case 0:
        brick = {
          width: 100,
          height: 40,
          x: i * 100,
          y: 100,
          colour: 'green',
          health: 1
        }
        break

      case 1:
        brick = {
          width: 100,
          height: 40,
          x: i * 100,
          y: 100,
          colour: 'orange',
          health: 2
        }
        break
    }
    generatedBricks.push(brick)

  }

  // * generation for several rows
  // for (let rowIndex = 0; rowIndex < level1.length; rowIndex++) {
  //   let row = []
  //   for (let columnIndex = 0; columnIndex < level1[rowIndex].length; columnIndex++) {
  //     let brick
  //     switch (level1[rowIndex][columnIndex]) {
  //       case 0:
  //         brick = {
  //           width: 100,
  //           height: 40,
  //           x: columnIndex * 100,
  //           y: rowIndex * 100,
  //           colour: 'green',
  //           health: 1
  //         }
  //         break

  //       case 1:
  //         brick = {
  //           width: 100,
  //           height: 40,
  //           x: columnIndex * 100,
  //           y: rowIndex * 100,
  //           colour: 'orange',
  //           health: 2
  //         }
  //         break
  //     }
  //     row.push(brick)
  //   }
  //   generatedBricks.push(row)
  // }
}

const displayBricks = () => {
  displayedBricks = []
  displayedBricks = generatedBricks.filter(brick => brick.health > 0)

  // * filters for several rows
  // displayedBricks[rowIndex] = generatedBricks[rowIndex].filter(brick => brick.health > 0)
  // let generatedRow
  // for (let rowIndex = 0; rowIndex < generatedBricks.length; rowIndex++) {
  //   displayedBricks = generatedBricks[rowIndex].filter(brick => brick.health > 0)
  // }
  // displayedBricks = generatedRow.filter(row => row.length > 0)



  for (let i = 0; i < displayedBricks.length; i++) {
    ctx.fillStyle = displayedBricks[i].colour
    ctx.fillRect(displayedBricks[i].x, displayedBricks[i].y, displayedBricks[i].width, displayedBricks[i].height)
  }

  //* displays bricks for several rows
  // for (let rowIndex = 0; rowIndex < displayedBricks.length; rowIndex++) {
  //   for (let columnIndex = 0; columnIndex < displayedBricks[rowIndex].length; columnIndex++) {
  //     ctx.fillStyle = displayedBricks[rowIndex][columnIndex].colour
  //     ctx.fillRect(displayedBricks[rowIndex][columnIndex].x, displayedBricks[rowIndex][columnIndex].y, displayedBricks[rowIndex][columnIndex].width, displayedBricks[rowIndex][columnIndex].height)
  //   }
  // }

  if (displayedBricks.length === 0) {
    youWin()
  }
}

const inputHandling = (event) => {
  switch (event.key) {
    case "ArrowLeft":
      paddle.x += paddle.speed * paddle.direction
      if (paddle.x <= 0) {
        paddle.x = 0
      }
      break
    case "ArrowRight":
      paddle.x += paddle.speed * paddle.direction * -1
      if (paddle.x >= game.width - paddle.width) {
        paddle.x = game.width - paddle.width
      }
      break

    case ' ':
      if (currentGameState === gameStates.running) {
        currentGameState = gameStates.paused
        cancelAnimationFrame(gameLoop)
      }

      else if (currentGameState === gameStates.paused) {
        currentGameState = gameStates.running
        requestAnimationFrame(playGame)
      }

      else if (currentGameState === gameStates.gameOver) {
        currentGameState = gameStates.running
        reset()
      }

      else if (currentGameState === gameStates.victory) {
        currentGameState = gameStates.running
        reset()
      }
  }
}

const detectCollision = () => {

  // EDGE DETECTION
  if (ball.y <= 0) {
    ball.directionY *= -1
  }
  if (ball.x <= 0 || ball.x >= game.width - ball.size) {
    ball.directionX *= -1
  }

  // GAME OVER
  if (ball.y >= game.height - ball.size) {
    gameOver()
  }


  // PADDLE DETECTION
  let paddleThird = paddle.width / 3

  // ball bottom touches paddle top
  if (ball.y >= paddle.y - ball.size && ball.x >= paddle.x && ball.x < paddle.x + paddle.width - ball.size) {
    ball.directionY *= -1

    // left side
    if (ball.x <= paddle.x + paddleThird) {
      ball.directionX = -1
    }

    // right side
    else if (ball.x >= paddle.x + paddleThird * 2) {
      ball.directionX = 1
    }

    // middle
    else {
      ball.directionX = 0
    }
  }


  // BRICK DETECTION
  // for (let rowIndex = 0; rowIndex < displayedBricks.length; rowIndex++) {
  //   for (let columnIndex = 0; columnIndex < displayedBricks[rowIndex].length; columnIndex++) {
  //     const brick = displayedBricks[rowIndex][columnIndex]

  for (let i = 0; i < displayedBricks.length; i++) {
    const brick = displayedBricks[i]

    if (ball.x + ball.size > brick.x && ball.x < brick.x + brick.width) {

      // BRICK TOP
      if (ball.y < brick.y + brick.height) {
        if (ball.y > brick.y - ball.size) {
          ball.directionY = -1
          brick.health--
          score++
          scoreEl.innerHTML = `${score}`
        }
      }

      // BRICK BOTTOM
      if (ball.y > brick.y) {
        if (ball.y <= brick.y + brick.height) {
          ball.directionY *= -1
          brick.health--
          score++
          scoreEl.innerHTML = `${score}`
        }
      }
    }
  }
}

const gameOver = () => {
  currentGameState = gameStates.gameOver
  cancelAnimationFrame(gameLoop)
  ctx.clearRect(0, 0, game.width, game.height)
  ctx.font = 'bold 100px Verdana'
  ctx.fillStyle = 'red'
  ctx.fillText('YOU DIED', 120, 300)
}

const youWin = () => {
  currentGameState = gameStates.victory
  cancelAnimationFrame(gameLoop)
  ctx.clearRect(0, 0, game.width, game.height)
  ctx.font = 'bold 100px Verdana'
  ctx.fillStyle = 'blue'
  ctx.fillText('YOU WIN', 120, 300)
}

const reset = () => {
  ctx.clearRect(0, 0, game.width, game.height)
  requestAnimationFrame(playGame)
  generatedBricks = []
  generateBricks()
  displayedBricks = []
  ball.x = 50
  ball.y = 150
  ball.directionX = 1
  ball.directionY = 1
  paddle.x = 300
  paddle.y = 550
  score = 0
  scoreEl.innerHTML = '0'
}

const playGame = () => {
  currentGameState = gameStates.running
  ctx.clearRect(0, 0, game.width, game.height)
  gameLoop = requestAnimationFrame(playGame)
  displayBall()
  displayPaddle()
  displayBricks()
  detectCollision()
}

document.addEventListener('DOMContentLoaded', () => {
  canvas = document.getElementById('canvas')
  canvas.style.background = '#ddd'
  ctx = canvas.getContext('2d')

  document.addEventListener('keydown', (keyboardEvent) => inputHandling(keyboardEvent))
  generateBricks()
  displayBricks()
  displayBall()
  displayPaddle()
  requestAnimationFrame(playGame)
})

// todo ADD SEVERAL ROWS, POWERUPS, SEVERAL LEVELS

// todo ADD COLOR CHANGE ON BRICK TOUCH, ADD BALL IMAGE
