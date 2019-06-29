var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleWare = require("../middleware");

router.get("/", function(req, res){
    //res.render("campgrounds", {campgrounds: campgrounds});    
    //Get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds){
        if (err){
            console.log(err);
        } else{
           res.render("campgrounds/index", {campgrounds: allCampgrounds, currentUser: req.user}); 
        }
    })
})
router.post("/", middleWare.isLoggedIn, function(req, res){
    var name = req.body.name;
    var image = req.body.image;
    var description = req.body.description;
    var price = req.body.price;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newCampground = {name: name, price: price, image: image, description: description, author: author
    };
    Campground.create(newCampground, function(err, newCamp){
        if (err){
            console.log(err)
        } else{
            res.redirect("/campgrounds");
        }
    })
    
})
router.get("/new", middleWare.isLoggedIn, function(req, res){
    res.render("campgrounds/new.ejs");
})

router.get("/:id", function(req, res){
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCamp){
        if (err || !foundCamp){
            console.log(err);
            req.flash('error', "Sorry, that campground does not exist!")
            return res.redirect("/campgrounds");
        } else{
            res.render("campgrounds/show", {campground: foundCamp})
        }
    });
})

// Edit campground
router.get("/:id/edit", middleWare.checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
            res.render("campgrounds/edit", {campground: foundCampground});
        })
})

// Update campground
router.put("/:id", middleWare.checkCampgroundOwnership, function(req, res){
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCamp){
            res.redirect("/campgrounds/" + req.params.id)
    })
})

// Destroy route

router.delete("/:id", middleWare.checkCampgroundOwnership, function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err){
            res.redirect("/campgrounds");
    });
})


module.exports = router;