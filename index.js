const api = {
	BASE_URL: 'https://ehlnvmqocwvq3all6bvxgjwqoi0ktuxx.lambda-url.ap-southeast-1.on.aws',
};
const ui = {
	inputTown: null,
	inputStoreyRange: null,
	inputFloorAreaSqm: null,
	inputAge: null,
	inputDate: null,
	labelPrediction: null,
	labelPredictionVariance: null,
	labelPredictionMeanVariance: null,
	buttonApiPredict: null,
	spinnerApiPredict: null,
};

function main() {
	for (const key of Object.keys(ui)) {
		ui[key] = document.getElementById(key);
	}
	const {
		inputTown,
		inputStoreyRange,
		inputFloorAreaSqm,
		inputAge,
		inputDate,
		labelPrediction,
		labelPredictionVariance,
		labelPredictionMeanVariance,
		buttonApiPredict,
		spinnerApiPredict,
	} = ui;

	labelPrediction.innerText
	labelPredictionVariance.innerText
	labelPredictionMeanVariance.innerText

	// Set the minimum date for today
	inputDate.value =
		inputDate.min = new Date().toISOString().split('T')[0];

	// Initialize the sample input options
	for (const townStr of ['ANG MO KIO', 'BEDOK', 'JURONG EAST', 'WOODLANDS', 'YISHUN']) {
		const option = document.createElement('option');
		option.value = townStr;
		option.innerText = townStr;
		inputTown.appendChild(option);
	}

	const apiPredictLoad = (done = false) => {
		buttonApiPredict.style.display = done ? "block" : "none";
		spinnerApiPredict.style.display = done ? "none" : "block";
	};

	api.predict = () => {
		const predictReq = {
			'town': inputTown.value,
			'storey_range': Number.parseInt(inputStoreyRange.value),
			'floor_area_sqm': Number.parseInt(inputFloorAreaSqm.value),
			'age': Number.parseInt(inputAge.value),
			'date': inputDate.value
		};

		const request = new Request(`${api.BASE_URL}/predict`, {
			method: 'POST',
			body: JSON.stringify(predictReq),
		});

		apiPredictLoad(false);

		fetch(request).
			then(
				response => {
					if (!response.ok) {
						api.onPredictErr(`${response.status}: ${response.statusText}`);
						return;
					}
					response.json().
						then(
							resJson => api.onPredict(resJson),
							err => api.onPredict(null, err),
						)
				},
				err => api.onPredictErr(`fetch failed: ${JSON.stringify(err)}`)
			).
			finally(() => apiPredictLoad(true));
	};
	api.onPredict = (resJson, err) => {
		console.log(resJson, err);
		if (err) {
			api.onPredictErr(`${JSON.stringify(err)}`);
			return;
		}
		if (!resJson) {
			api.onPredictErr('no response');
			return;
		}
		if (!resJson.data) {
			api.onPredictErr('"data" is undefined');
			return;
		}
		const {
			prediction,
			prediction_mean_variance,
			prediction_variance,
		} = resJson.data;
		labelPrediction.innerText = prediction;
		labelPredictionVariance.innerText = prediction_variance;
		labelPredictionMeanVariance.innerText = prediction_mean_variance;
	};
	api.onPredictErr = (errMsg) => {
		labelPrediction.innerText = '-';
		labelPredictionVariance.innerText = '-';
		labelPredictionMeanVariance.innerText = '-';
		console.error(errMsg);
	};
}
