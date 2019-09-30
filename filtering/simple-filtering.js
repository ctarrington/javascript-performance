const randomFromArray = (array) => {
    const index = Math.floor(Math.random()*array.length);
    return array[index];
};

const randomSubsetOfArray = (array, ratio) => {
    const subset = [];
    for (let ctr=0; ctr<array.length; ctr++) {
        if (Math.random() <= ratio) {
            subset.push(array[ctr]);
        }
    }

    return subset;
};

const simpleFiltering = (servingCount, inPlace) => {
    const possibleFlavors = ['vanilla', 'chocolate', 'strawberry'];
    const possibleToppings = ['peanuts', 'jimmys', 'sprinkles', 'walnuts', 'fudge', 'caramel'];

    const servings = [];

    for (let ctr=0; ctr<servingCount; ctr++) {
        servings.push({
            flavor: randomFromArray(possibleFlavors),
            toppings: randomSubsetOfArray(possibleToppings, 0.20),
        });
    }

    const criteria = [
        {
            flavors: ['vanilla'],
            toppings: ['peanuts', 'walnuts'],
        },
        {
            flavors: ['vanilla', 'chocolate'],
            toppings: ['peanuts', 'fudge', 'caramel'],
        }
    ];

    const filterServings = (criteria) => {
        if (inPlace) {
            servings.forEach(serving => {
                if (criteria.flavors.indexOf(serving.flavor) < 0) {
                    serving.visible = false;
                    return;
                }

                let toppingFound = false;
                for (let ctr = 0; ctr < serving.toppings.length; ctr++) {
                    if (criteria.toppings.indexOf(serving.toppings[ctr]) >= 0) {
                        toppingFound = true;
                    }
                }

                if (!toppingFound) {
                    serving.visible = false;
                    return;
                }

                // and so on if we add additional properties

                serving.visible = true;
            });
        } else {
            return servings.filter(serving => {
                if (criteria.flavors.indexOf(serving.flavor) < 0) {
                    return false;
                }

                let toppingFound = false;
                for (let ctr = 0; ctr < serving.toppings.length; ctr++) {
                    if (criteria.toppings.indexOf(serving.toppings[ctr]) >= 0) {
                        toppingFound = true;
                    }
                }

                if (!toppingFound) {
                    return false;
                }

                // and so on if we add additional properties

                return true;
            });
        }
    };

    let runningTime = 0;
    criteria.forEach(criteria => {
        const startTime = new Date().getTime();
        const filtered = filterServings(criteria);
        const elapsed = new Date().getTime() - startTime;
        runningTime += elapsed;
    });

    const method = inPlace ? 'simple in place' : 'simple with filter';

    return {
        method,
        count: servings.length,
        averageTime: runningTime / criteria.length,
    };
};