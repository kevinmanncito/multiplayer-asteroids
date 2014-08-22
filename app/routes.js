var Score = require('./models/score');

module.exports = function(app) {
    // server routes------------------------------------

// ======================
// API's
// ======================
    app.get('/v1/high-scores', function(req, res) {
        Score.find(function(err, scores) {
            if (err) 
                res.send(err)
            res.json(scores);
        });
    });

    app.post('/v1/high-scores', function(req, res) {
        console.log("made it here");
        Score.create({
            name: req.body.name,
            score : req.body.score
        }, function(err, score) {
            if (err) 
                res.send(err);

            Score.find(function(err, scores) {
                if (err)
                    res.send(err)
                res.json(scores);
            });
        });
    });

    app.delete('/v1/high-scores/:score_id', function(req, res) {
        Score.remove({
            _id : req.params.score_id
        }, function(err, score) {
            if (err) 
                res.send(err);

            Score.find(function(err, scores) {
                if (err)
                    res.send(err)
                res.json(scores);
            });
        });
    });

// =====================
// frontend routes
// =====================
    app.get('*', function(req, res) {
        res.sendfile('./public/index.html');
    });

}