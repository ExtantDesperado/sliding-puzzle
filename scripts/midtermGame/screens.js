engine.screenManager.registerScreen('homeScreen',
	function initialize() {
		console.log('initializing homeScreen...');
		document.getElementById('homeToNewGameButton').onclick = () => engine.screenManager.changeScreen('newGameScreen');
		document.getElementById('homeToHighScoresButton').onclick = () => engine.screenManager.changeScreen('highScoresScreen');
		document.getElementById('homeToCreditsButton').onclick = () => engine.screenManager.changeScreen('creditsScreen');
	},
	function run() {
		console.log('running homeScreen...');
	}
);

engine.screenManager.registerScreen('newGameScreen',
	function initialize() {
		console.log('initializing newGameScreen...');
		document.getElementById('newGameToEasyButton').onclick = () => { 
			game.model.initializeGame('easy');
			engine.startGameLoop();
			engine.screenManager.changeScreen('gameScreen');
		};
		document.getElementById('newGameToHardButton').onclick = () => {
			game.model.initializeGame('hard');
			engine.startGameLoop();
			engine.screenManager.changeScreen('gameScreen');
		};
		document.getElementById('newGameToHomeButton').onclick = () => engine.screenManager.changeScreen('homeScreen');
	},
	function run() {
		console.log('running newGameScreen...');
	}
);

engine.screenManager.registerScreen('gameScreen',
	function initialize() {
		console.log('initializing gameScreen...');
		document.getElementById('gameToHomeButton').onclick = () => {
			engine.stopGameLoop();
			engine.screenManager.changeScreen('homeScreen');
		};
	},
	function run() {
		console.log('running gameScreen...');
	}
);

engine.screenManager.registerScreen('highScoresScreen',
	function initialize() {
		console.log('initializing highScoresScreen...');
		document.getElementById('highScoresToHomeButton').onclick = () => engine.screenManager.changeScreen('homeScreen');
	},
	function run() {
		const NUM_HIGH_SCORES = 5;

		console.log('running highScoresScreen...');
		easyTable = document.getElementById('easyTable');
		hardTable = document.getElementById('hardTable');

		highScores = engine.storage.load('highScores');

		easyString = '<tr><th colspan="2">Easy</th></tr><tr><th>Best Times</th><th>Best Number of Moves</th></tr>';
		hardString = '<tr><th colspan="2">Hard</th></tr><tr><th>Best Times</th><th>Best Number of Moves</th></tr>';

		for (let i = 0; i < NUM_HIGH_SCORES; i++) {
			easyString += '<tr>';
			if (highScores !== null && highScores.hasOwnProperty('easy') && i < highScores.easy.time.length) {
				easyString += '<td>' + highScores.easy.time[i].toFixed(2) + '</td>';
			} else {
				easyString += '<td>-</td>';
			}
			if (highScores !== null && highScores.hasOwnProperty('easy') && i < highScores.easy.moves.length) {
				easyString += '<td>' + highScores.easy.moves[i] + '</td>';
			} else {
				easyString += '<td>-</td>';
			}
			easyString += '</tr>';

			hardString += '<tr>';
			if (highScores !== null && highScores.hasOwnProperty('hard') && i < highScores.hard.time.length) {
				hardString += '<td>' + highScores.hard.time[i].toFixed(2) + '</td>';
			} else {
				hardString += '<td>-</td>';
			}
			if (highScores !== null && highScores.hasOwnProperty('hard') && i < highScores.hard.moves.length) {
				hardString += '<td>' + highScores.hard.moves[i] + '</td>';
			} else {
				hardString += '<td>-</td>';
			}
			hardString += '</tr>';
		}

		easyTable.innerHTML = easyString;
		hardTable.innerHTML = hardString;
	}
);

engine.screenManager.registerScreen('creditsScreen',
	function initialize() {
		console.log('initializing creditsScreen...');
		document.getElementById('creditsToHomeButton').onclick = () => engine.screenManager.changeScreen('homeScreen');
	},
	function run() {
		console.log('running creditsScreen...');
	}
);

engine.screenManager.initializeScreens();