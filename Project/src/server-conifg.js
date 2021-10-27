// Requiring express npm module
const express = require('express');
const server = express();

// Calling the server-utilities.js file
const utils = require('./utils/server-utilities.js');

// Storing data to run Mongodb in variables
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const connectionURL = `mongodb://127.0.0.1:27017`;
const databaseName = `project`;

// Serving up HTML,CSS and Js static content
const path = require('path');
const dirPath = path.join(__dirname, '../public');
server.use(express.static(dirPath))

// Configuring the Server to use hbs Template Engine
server.set('view engine', 'hbs');

// Configuring the Server to serve dynamic HTML Pages
server.get('/manager.hbs', function(request, response){
    response.render('manager');
});

server.get('/food_items_manager.hbs', function(request, response){
    response.render('food_items_manager');
});

server.get('/addItem', function(request, response){
    response.render('add_food_item');
})

server.get('/test', function(request, response){
    response.render('test')
})

// Connecting to the database and setting up http endpoints
MongoClient.connect(connectionURL, {useNewUrlParser: true}, function(error, client){
    // Setting up Error Handling
    if (error){
        return console.log(`[-] Unable to Connect to Database...Please Try Again`);
    }

    // Creating the Database
    const db = client.db(databaseName);

    // Setting up JSON HTTP Endpoints
    server.get('/signup', function(request, response){
        utils.addUser(request.query.username, request.query.email, request.query.password, request.query.type, request.query.restaurent
            ,db);
        response.send("[+] User Added");
    });

    server.get('/loginUser', function(request, response){
        utils.loginUser(request.query.username, request.query.password, request.query.type, db);
        response.send("[+] Congrats you exist");
    });

    server.get('/currentOrders', function(request, response){
        utils.addOrder(request.query.customerName, request.query.foodName, request.query.restaurent,db, function(customerName, foodName, time, 
            restaurent, db){
            // console.log("****TimeToMakeFood*****:   ", time);
            db.collection('current-orders').insertOne({
                customerName: customerName,
                foodName: foodName,
                count: 0,
                start: false,
                done: false,
                time: time,
                restaurent: restaurent
            }, function(error, result){
                if(error){
                    return console.log("[-] Unable to process the order");
                }
                // Updating Current-Orders Table
                utils.updateOrders(foodName, restaurent, db);

                // Updating catalog table to increase no. of times food is ordered
                db.collection('catalog').updateMany({
                    foodName: foodName,
                    restaurent: restaurent
                }, {
                    $inc: {
                        numberOfTimesOrdered: 1
                    }
                }).then(function(result){
                    //console.log(result);
                }).catch(function(error){
                    //console.log(error);
                })
            });
        
        });
        response.send("[+] Order Placed!!");
    });

    server.get('/foodCatalog', function(request, response){
        utils.addFood(request.query.foodName, request.query.timeToPreapare, request.query.imageUrl, request.query.price, request.query.tags, 
            request.query.preaparation, request.query.ingredients, request.query.restaurent, db);
        response.send("[+] Food Added");
    });

    server.get('/deleteItem', function(request, response){
        //console.log(request.query.foodName, request.query.restaurent);
        utils.deleteFoodItem(request.query.foodName, request.query.restaurent, db);
        response.send("[-] Food Deleted");
    });

    // HTTP Endpoint to get Restaurent's Food Data
    server.get('/getFoodData', function(request, response){
        const foodItems = utils.getRestaurentFood(request.query.restaurent, db, function(foodItems){
           response.send(foodItems)
        });
        
    })
});

// Starting the server at port 3000
server.listen(3000, function(){
    console.log(`[+] Server Started at Port: 3000`);
});

// Modification ---> restaurent wise count and numberOfTimesOrdered