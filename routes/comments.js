var express = require("express");
var router = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleWare = require("../middleware");

router.get("/new", middleWare.isLoggedIn,  function(req, res){
    Campground.findById(req.params.id, function(err, campground){
        if (err){
            console.log(err);
        } else{
            if (!campground){
                return res.status(400).send("Item not found.");
            }
            res.render("comments/new", {campground: campground});
        }
    })
});

router.post("/", middleWare.isLoggedIn,  function(req, res){
    // lookup campground using ID
    // create new comment
    // connect new comment to campground
    // redirect campground show page
    Campground.findById(req.params.id, function(err, campground){
        if (err){
            console.log(err);
            res.redirect("/campgrounds");
        } else {
            Comment.create(req.body.comment, function(err, comment){
                if (err){
                    req.flash("error", "Something went wrong");
                    console.log(err);
                } else{
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    campground.comments.push(comment);
                    campground.save();
                    req.flash("success", "Successfully added comment");
                    res.redirect('/campgrounds/' + campground._id);
                }
            });
        }
    })
})

// Comment edit route
router.get("/:comment_id/edit", middleWare.checkCommentOwnership, function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComment){
        if (err){
            res.redirect("back");
        } else {
            if (!foundComment){
                return res.status(400).send("Item not found.");
            }
            res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
        }
    })
})

// Comment update route

router.put("/:comment_id", middleWare.checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComments){
        if (err){
            res.redirect("back");
        } else {
        res.redirect("/campgrounds/" + req.params.id);
    }
    })
})

// Delete comment route
router.delete("/:comment_id", middleWare.checkCommentOwnership, function(req, res){
    // findById and Remove
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if (err){
            res.redirect("back");
        } else {
            req.flash("success", "Comment deleted");
            res.redirect("/campgrounds/" + req.params.id);
        }
    })
})

module.exports = router;