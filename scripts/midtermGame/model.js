(function() {

	let particleSystem = engine.particleManager.getParticleSystem([
	    {
	        particlesPerSecond: 1000,
	        speed: {
	            mean: 50,
	            stdDev: 10
	        },
	        lifetime: {
	            mean: 0.5,
	            stdDev: 0.2
	        },
	        image: engine.graphics.getImage('assets/images/star.png'),
	        scale: {
	        	mean: 0.05,
	        	stdDev: 0.01
	        },
	        rotation: {
	        	mean: 180,
	        	stdDev: 20
	        },
	        angularVelocity: {
	        	mean: 0,
	        	stdDev: 360
	        }
	    }
	]);

	let images4x4 = [];

	for (let i = 0; i < 15; i++) {
		images4x4.push(engine.graphics.getImage('assets/images/Tile128-' + i + '.png'));
	}

	let images16x16 = [];

	for (let i = 0; i < 63; i++) {
		images16x16.push(engine.graphics.getImage('assets/images/Tile64-' + i + '.png'));
	}

	let board = [];
	let tileSize = 128;
	let dim = 4;

	let timer = 0;
	let numMoves = 0;

	let timerDisplay = document.getElementById('timerDisplay');
	let numMovesDisplay = document.getElementById('numMovesDisplay');

	const ANIMATION_DURATION = 0.25;
	let animationTimer = 0;
	let animationSource = 0;		// Index of image to be animated.
	let animationDest = 0;			// Index that the image should move to.

	let solved = false;

	const NUM_HIGH_SCORES = 5;

	let difficulty = 'easy';

	game.model.initializeGame = function(mode) {
		timer = 0;
		numMoves = 0;

		animationTimer = 0;

		solved = false;

		board = [];
		if (mode === 'easy') {
			for (let i = 0; i < 15; i++) {
				board.push({
					image: images4x4[i],
					number: i
				});
			}
			tileSize = 128;
			dim = 4;
		} else if (mode === 'hard') {
			for (let i = 0; i < 63; i++) {
				board.push({
					image: images16x16[i],
					number: i
				});
			}
			tileSize = 64;
			dim = 8;
		} else {
			console.log('INVALID GAME MODE -- must be \'easy\' or \'hard\'');
			return;
		}

		difficulty = mode;

		// Shuffle board tiles, algorithm from https://gomakethings.com/how-to-shuffle-an-array-with-vanilla-js/
		for (let i = board.length - 1; i >= 0; i--) {
			let swapIndex = Math.floor(Math.random() * (i + 1));

			let temp = board[i];
			board[i] = board[swapIndex];
			board[swapIndex] = temp;
		}

		// Add blank tile to beginning of array (top left corner of board).
		board.unshift(null);
	};

	function checkIfDone() {
		for (let i = 0; i < board.length; i++) {
			if (board[i] === null){
				if (i !== board.length - 1) {
					return false;		// Blank square is not in bottom right corner.
				}
			} else if (board[i].number !== i) {
				return false;			// Square is in the wrong position.
			}
		}

		return true;
	}

	game.model.update = function(elapsedTime) {
		if (!solved) {
			timer += elapsedTime / 1000;

			if (animationTimer > 0) {
				animationTimer -= elapsedTime / 1000;

				if (animationTimer <= 0) {
					if (board[animationSource].number === animationDest) {
						// Correct tile placement.
						let centerX = (animationDest % dim) * tileSize + tileSize / 2;
						let centerY = Math.floor(animationDest / dim) * tileSize + tileSize / 2;
						particleSystem.createParticles(20,
							(t) => ({ x: centerX - tileSize / 2, y: centerY + t * tileSize - tileSize / 2 }),
							(t, position) => Math.atan2(position.y - centerY, position.x - centerX) * 180 / Math.PI);
						particleSystem.createParticles(20,
							(t) => ({ x: centerX + tileSize / 2, y: centerY + t * tileSize - tileSize / 2 }),
							(t, position) => Math.atan2(position.y - centerY, position.x - centerX) * 180 / Math.PI);
						particleSystem.createParticles(20,
							(t) => ({ x: centerX + t * tileSize - tileSize / 2, y: centerY - tileSize / 2 }),
							(t, position) => Math.atan2(position.y - centerY, position.x - centerX) * 180 / Math.PI);
						particleSystem.createParticles(20,
							(t) => ({ x: centerX + t * tileSize - tileSize / 2, y: centerY + tileSize / 2 }),
							(t, position) => Math.atan2(position.y - centerY, position.x - centerX) * 180 / Math.PI);
					}

					// Swap tiles in the internal data structure.
					board[animationDest] = board[animationSource];
					board[animationSource] = null;

					if (checkIfDone()) {
						console.log('You win!', timer, numMoves);
						solved = true;

						let highScores = engine.storage.load('highScores') || {};

						if (!highScores.hasOwnProperty(difficulty)) {
							highScores[difficulty] = {
								time: [],
								moves: []
							};
						}

						highScores[difficulty].time.push(timer);
						highScores[difficulty].moves.push(numMoves);

						highScores[difficulty].time.sort();
						highScores[difficulty].moves.sort();

						highScores[difficulty].time = highScores[difficulty].time.slice(0, NUM_HIGH_SCORES);
						highScores[difficulty].moves = highScores[difficulty].moves.slice(0, NUM_HIGH_SCORES);

						engine.storage.save('highScores', highScores);
					}
				}
			}
		}
	};

	game.model.render = function(elapsedTime) {
		timerDisplay.innerHTML = 'Time: ' + timer.toFixed(2) + ' seconds';
		numMovesDisplay.innerHTML = 'Number of moves: ' + numMoves;

		engine.graphics.clear();
		for (let i = 0; i < board.length; i++) {
			if (board[i] !== null) {
				if (animationTimer > 0 && i === animationSource) {
					let offsetX = ((animationSource % dim) - (animationDest % dim)) * tileSize * (animationTimer / ANIMATION_DURATION - 1);
					let offsetY = (Math.floor(animationSource / dim) - Math.floor(animationDest / dim)) * tileSize * (animationTimer / ANIMATION_DURATION - 1);
					let x = (i % dim) * tileSize + tileSize / 2 + offsetX;
					let y = Math.floor(i / dim) * tileSize + tileSize / 2 + offsetY;
					board[i].image.draw(x, y, 1, 1, 0);
					engine.graphics.drawRect(x, y, tileSize, tileSize, 0, 'black', '');
				} else {
					let x = (i % dim) * tileSize + tileSize / 2;
					let y = Math.floor(i / dim) * tileSize + tileSize / 2;
					board[i].image.draw(x, y, 1, 1, 0);
					engine.graphics.drawRect(x, y, tileSize, tileSize, 0, 'black', '');
				}
			}
		}

		if (solved) {
			engine.graphics.drawText('You Win!!!', engine.canvas.width / 2, engine.canvas.height / 2, '50px Lucida Console', 'white', 'white');
		}
	};



	function checkNeighborsForNull(row, col) {
		if (row !== 0) {
			if (board[(row - 1) * dim + col] === null) {
				return {
					row: row - 1,
					col: col
				};
			}
		}
		if (row !== dim - 1) {
			if (board[(row + 1) * dim + col] === null) {
				return {
					row: row + 1,
					col: col
				};
			}
		}
		if (col !== 0) {
			if (board[row * dim + (col - 1)] === null) {
				return {
					row: row,
					col: col - 1
				};
			}
		}
		if (col !== dim - 1) {
			if (board[row * dim + (col + 1)] === null) {
				return {
					row: row,
					col: col + 1
				};
			}
		}

		return null;
	};

	engine.inputManager.mouse.registerMouseDown(function(e) {
		if (!solved) {
			// If there isn't an ongoing animation.
			if (animationTimer <= 0) {
				let x = e.pageX - engine.canvas.offsetLeft;
				let y = e.pageY - engine.canvas.offsetTop;
				let curCell = {
					row: Math.floor(dim * y / engine.canvas.height),
					col: Math.floor(dim * x / engine.canvas.width)
				};
				let targetCell = checkNeighborsForNull(curCell.row, curCell.col);

				if (targetCell !== null) {
					animationSource = curCell.row * dim + curCell.col;
					animationDest = targetCell.row * dim + targetCell.col;

					numMoves += 1;

					animationTimer = ANIMATION_DURATION;
				}
			}
		}
	});

})();