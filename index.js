const api = {
	BASE_URL: 'https://ehlnvmqocwvq3all6bvxgjwqoi0ktuxx.lambda-url.ap-southeast-1.on.aws',
};

/**
 * @returns {{string: HTMLElement | null}}
 */
function _initUI() {
	const uiIDList = [
		'inputTown',
		'inputStoreyRange',
		'inputAreaSqFt',
		'inputAge',
		'inputYear',
		'inputMonth',
		'labelPredictedPrice',
		'buttonApiPredict',
		'spinnerApiPredict',
	];
	const uiMap = {};
	for (const id of uiIDList) {
		uiMap[id] = document.getElementById(id);
		if (!uiMap[id]) {
			console.error(`Element id "${id}" not found`)
			continue;
		}
	}
	return uiMap;
}

function main() {
	const {
		inputTown,
		inputStoreyRange,
		inputAreaSqFt,
		inputAge,
		inputYear,
		inputMonth,
		labelPredictedPrice,
		buttonApiPredict,
		spinnerApiPredict,
	} = _initUI();

	// Set the minimum year and month for today
	const dateChunks = new Date().toISOString().split('-');
	inputYear.value =
		inputYear.min = dateChunks[0];
	inputMonth.value = dateChunks[1];

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
		/*
		Request interface:
			town
			storey_range
			age
			area_sqft
			month
			year
		*/
		const predictReq = {
			'town': inputTown.value,
			'storey_range': Number.parseInt(inputStoreyRange.value),
			'age': Number.parseInt(inputAge.value),
			'area_sqft': Number.parseInt(inputAreaSqFt.value),
			'month': Number.parseInt(inputMonth.value),
			'year': Number.parseInt(inputYear.value),
		};
		console.log(predictReq);

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
		/*
		Response interface:
			predicted_price
		*/
		const {
			predicted_price,
		} = resJson;
		labelPredictedPrice.innerText = Math.floor(predicted_price);
	};
	api.onPredictErr = (errMsg) => {
		labelPredictedPrice.innerText = '-';
		console.error(errMsg);
	};
}
