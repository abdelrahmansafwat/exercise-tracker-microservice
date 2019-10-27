require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const exerciseModel = require("./models/exercise");
const userModel = require("./models/user");
const app = express();

app.use(express.urlencoded({extended: true}));

app.use(express.static('public'))
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html')
});

async function getUsername(userId){
    var userId = await userModel.findById(userId);
    return userId.username;
}

app.post('/api/exercise/new-user', (req, res) => {
    var newUser = new userModel({ username: req.body.username });
    newUser.save((err, data) => {
        if(err) return console.error(err);
        res.json(data);
    });
});

app.post('/api/exercise/add', async (req, res) => {
    var username = await getUsername(req.body.userId);

    if(username == null){
        return res.send("unknown _id");
    }

    exerciseModel.findOneAndUpdate({ _id: req.body.userId }, {
        username: username,
        $push: { log: {
            description: req.body.description,
            duration: req.body.duration,
            _id: req.body.userId,
            date: req.body.date
        } }
    }, {new: true, upsert: true}, (err, data) => {
        if(err) return console.error(err);
        res.json(data);
    });
});

app.get('/api/exercise/log', (req, res) => {
    var options = [
        { $match: {_id: mongoose.Types.ObjectId(req.query.userId) }},
    ];

    
    if(req.query.from && req.query.to){
        options.push(
            { $unwind: '$log'},
            { $match: {'log.date': { $gte: new Date(req.query.from), $lte: new Date(req.query.to) }}},
            { $group: {_id: '$_id', username: {$first: '$username'}, log: {$push: '$log'} }}
        );
    }
    else if(req.query.from){
        options.push(
            { $unwind: '$log'},
            { $match: {'log.date': { $gte: new Date(req.query.from) }}},
            { $group: {_id: '$_id', username: {$first: '$username'}, log: {$push: '$log'} }}
        );
    }
    else if(req.query.to){
        options.push(
            { $unwind: '$log'},
            { $match: {'log.date': { $lte: new Date(req.query.to) }}},
            { $group: {_id: '$_id', log: {$push: '$log'}, username: {$first: '$username'}}}
        );
    }
    
    if(req.query.limit){
        if(options.length > 1){
            options.splice(-1, 0, {
                $limit: parseInt(req.query.limit)
            });
        }
        else {
            options.push({
                $limit: parseInt(req.query.limit)
            });
        }
    }

    exerciseModel.aggregate(options). then((data) => {
        data[0].from = req.query.from;
        data[0].to = req.query.to;
        data[0].limit = req.query.limit;
        res.json(data[0]);
    });
});

app.listen(process.env.PORT | 3000);

