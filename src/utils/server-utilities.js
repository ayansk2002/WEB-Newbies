const mongodb = require('mongodb');
let foodAvailability = 0;
let time = 0;

const addCustomer = function(username, email, password, db, callback){
    db.collection('users').insertOne({
        username: username,
        password: password,
        email: email,
    }, function(error, result){
        if(error){
            console.log("Unable to add User");
            const error = "error";
            callback(error);
        }
        else{
            const success = "success";
            callback(success);
        }

        //console.log(result.ops);
    });
}

const loginUser = function(username, password, type,db){
    db.collection('users').findOne({
        username: username,
        password: password,
        type: type,
        restaurent: restaurent
    }, function(error, user){
        if (error){
            return console.log("[-] No Such User Exists");
        }

        //console.log(user);
    })
}

const updateOrders = function(foodName, restaurent,db){
    db.collection('current-orders').find({
        foodName: foodName,
        restaurent: restaurent
    }).toArray(function(error, result){
        if (result){
            //console.log("**********Result*********\n", result);
            db.collection('current-orders').updateMany({
                foodName: foodName,
                restaurent: restaurent
            }, {
                $set: {
                    count: result.length
                }
            })
        }
    })
}

const checkFoodPresent = function(foodName, db){
    db.collection('catalog').findOne({
        foodName: foodName
    }, function(error, food){
        if(error){
            return console.log("[-] Unable To Access Database");
        }
        if (!food){
            foodAvailability = 0;
        }else{
            foodAvailability = 1
        }
    });
}

const addFood = function(foodName, timeToPreapare, imageUrl, price, tags, preaparation, ingredients, restaurent,db){
    checkFoodPresent(foodName, db);
    if(foodAvailability === 1){
        return console.log("[-] Food already Exists")
    }
    db.collection('catalog').insertOne({
        foodName: foodName,
        timeToPreapare: timeToPreapare,
        imageUrl: imageUrl,
        price: price,
        discount: 0,
        rating: 0,
        numberOfTimesOrdered: 0,
        tags: tags,
        preaparation: preaparation,
        ingredients: ingredients,
        restaurent: restaurent
    });
}

const addOrder = function(customerName, foodName, restaurent, db, callback){
    // Fetching Time To Preapare Food From Database
    db.collection('catalog').findOne({
        foodName: foodName
    }, function(error, food){
        if (error){
            return console.log("[-] Unable to fetch Time To Preapare Food");
        }

        time = food.timeToPreapare;
        // console.log("******Food********\n", food);
        // console.log("******FoodPrepTime********* ----> ", time);
        callback(customerName, foodName, time, restaurent, db);
    })
}

const deleteFoodItem = function(foodName, restaurent, db){
    db.collection('catalog').deleteOne({
        foodName: foodName,
        restaurent: restaurent
    }).then(function(result){
        console.log('The Result is --->\n', result)
    }).catch(function(error){
        console.log('The error is --->\n', error);
    })
}

const getRestaurentFood = function(restaurent, db, callback){
    db.collection('catalog').find({
        restaurent: restaurent
    }).toArray(function(error, foodItems){
        if (error){
            return console.log('Unable to fetch data');
        }
        callback(foodItems);
    });
}

module.exports = {
    addCustomer: addCustomer,
    loginUser: loginUser,
    addOrder: addOrder,
    updateOrders: updateOrders,
    addFood: addFood,
    deleteFoodItem: deleteFoodItem,
    getRestaurentFood: getRestaurentFood
}