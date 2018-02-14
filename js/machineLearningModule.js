var forest = new forestjs.RandomForest();
var dirty= true;
var ss= 50.0;
var density= 1;
var avgerr= 0;
var drawSoft = true;
var options = {};
var N;
var data;
var labels;
options.type = 1;

function runRandomForest(fullData, name) {
	// console.log('For ' + name + ' : '); // , fullData, name);

	let testData = [];
	for (let i = 0; i < fullData.length; i++) {
		if (fullData[i][0] == name) {
			let tmp = [];
			for (let j = 5; j < 58; j++) {
				tmp.push(fullData[i][j]);
			}
			testData.push(tmp);
		}
	}

	N = Math.floor(testData.length / 10); // number of data points to train with
	data = new Array(N);
	labels = new Array(N);

	for (let i = 0; i < N; i++) {
		data[i] = testData[i];
	}

	labelize(data);

	let iterations = 10;
	let finalRes = [0, 0];

	for (let i = 0; i < iterations; i++) {
		options.numTrees = 1000;
		options.maxDepth = 10;
		options.numTries = 10;
		forest.train(data, labels, options);

		let probabilities = forest.predict(testData);
		let res = analyze(probabilities);
		finalRes[0] += res[0] / iterations;
		finalRes[1] += res[1] / iterations;
	}

	return [finalRes[0] / N * 10, 100 - finalRes[0] / N * 10];
}

function labelize(testData) {
	// -1 is chat, 1 is mail

	for (let i = 0; i < N; i++) {
		if (testData[i][11] >= 2) {
			labels[i] = -1;
		} else {
			if (testData[i][23] > 3) {
				labels[i] = testData[i][24] < 50 ? -1 : 1;
			} else {
				if (testData[i][35] > 5) {
					labels[i] = testData[i][36] < 50 ? -1 : 1;
				} else {
					labels[i] = 1;
				}
			}
		}
	}
}

function analyze(probs) {
	let max = maxval(probs);
	let chatAmount = 0;
	let mailAmount = 0;

	for (let i = 0; i < N; i++) {
		labels[i] == -1 ? chatAmount++ : mailAmount++;
	}

	for (let i = N; i < probs.length; i++) {
		(probs[i] / max) < 0.5 ? chatAmount++ : mailAmount++;
	}

	return [chatAmount, mailAmount];
}

function maxval(probs) {
	let max = 0;
	for (let i = 0; i < probs.length; i++) {
		if (probs[i] > max) {
			max = probs[i];
		}
	}
	return max;
}