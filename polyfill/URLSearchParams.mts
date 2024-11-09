export class URLSearchParams {
	constructor(params?: string | Iterable<[string, string]> | object) {
		switch (typeof params) {
			case "string": {
				const pairs: Array<[string, string]> = params
					.slice(1)
					.split("&")
					.map(pair => pair.split("=") as [string, string]);
				pairs.forEach(([key, value]) => {
					this.#params.push(key);
					this.#values.push(value);
				});
				break;
			}
			case "object":
				if (Array.isArray(params)) {
					Object.entries(params).forEach(([key, value]) => {
						this.#params.push(key);
						this.#values.push(value as string);
					});
				} else if (Symbol.iterator in Object(params)) {
					for (const [key, value] of params as Iterable<[string, string]>) {
						this.#params.push(key);
						this.#values.push(value);
					}
				}
				break;
		}
		this.#updateSearchString(this.#params, this.#values);
	}

	// Create 2 seperate arrays for the params and values to make management and lookup easier.
	#param = "";
	#params: string[] = [];
	#values: string[] = [];

	// Update the search property of the URL instance with the new params and values.
	#updateSearchString(params, values) {
		if (params.length === 0) this.#param = "";
		else this.#param = params.map((param, index) => `${param}=${values[index]}`).join("&");
	}

	// Add a given param with a given value to the end.
	append(name: string, value: string): void {
		this.#params.push(name);
		this.#values.push(value);
		this.#updateSearchString(this.#params, this.#values);
	}

	// Remove all occurances of a given param
	delete(name: string, value?: string): void {
		while (this.#params.indexOf(name) > -1) {
			this.#values.splice(this.#params.indexOf(name), 1);
			this.#params.splice(this.#params.indexOf(name), 1);
		}
		this.#updateSearchString(this.#params, this.#values);
	}

	// Return an array to be structured in this way: [[param1, value1], [param2, value2]] to mimic the native method's ES6 iterator.
	entries(): Array<[string, string]> {
		return this.#params.map((param, index) => [param, this.#values[index]]);
	}

	// Return the value matched to the first occurance of a given param.
	get(name: string): string | undefined {
		return this.#values[this.#params.indexOf(name)];
	}

	// Return all values matched to all occurances of a given param.
	getAll(name: string): Array<string> {
		return this.#values.filter((value, index) => this.#params[index] === name);
	}

	// Return a boolean to indicate whether a given param exists.
	has(name: string, value?: string): boolean {
		return this.#params.indexOf(name) > -1;
	}

	// Return an array of the param names to mimic the native method's ES6 iterator.
	keys(): Array<string> {
		return this.#params;
	}

	// Set a given param to a given value.
	set(name: string, value: string): void {
		if (this.#params.indexOf(name) === -1) {
			this.append(name, value); // If the given param doesn't already exist, append it.
		} else {
			let first = true;
			const newValues: string[] = [];

			// If the param already exists, change the value of the first occurance and remove any remaining occurances.
			this.#params = this.#params.filter((currentParam, index) => {
				if (currentParam !== name) {
					newValues.push(this.#values[index]);
					return true;
					// If the currentParam matches the one being changed and it's the first one, keep the param and change its value to the given one.
				} else if (first) {
					first = false;
					newValues.push(value);
					return true;
				}
				// If the currentParam matches the one being changed, but it's not the first, remove it.
				return false;
			});
			this.#values = newValues;
			this.#updateSearchString(this.#params, this.#values);
		}
	}

	// Sort all key/value pairs, if any, by their keys then by their values.
	sort(): void {
		// Call entries to make sorting easier, then rewrite the params and values in the new order.
		const sortedPairs = this.entries().sort();
		this.#params = [];
		this.#values = [];
		sortedPairs.forEach(pair => {
			this.#params.push(pair[0]);
			this.#values.push(pair[1]);
		});
		this.#updateSearchString(this.#params, this.#values);
	}

	// Return the search string without the '?'.
	toString = (): string => (this.#param ? String(this.#param) : "");

	// Return and array of the param values to mimic the native method's ES6 iterator..
	values = (): Iterator<string> => this.#values.values();
}
