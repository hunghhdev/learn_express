var express = require('express')
var router = express.Router()
const { check, validationResult } = require('express-validator');

// Get page model
var Page = require('../models/page')

/*
 * Get page index
 */
router.get('/', function (req, res) {
    Page.find({}).sort({ sorting: 1 }).exec(function (err, pages) {
        res.render('admin/pages', {
            pages: pages
        })
    })
})

/*
 * Get add page
 */
router.get('/add-page', function (req, res) {
    var title = "";
    var slug = "";
    var content = "";

    res.render('admin/add_page', {
        title: title,
        slug: slug,
        content: content
    })
})

/*
 * Post add page
 */
router.post('/add-page', [
    check('title', 'Title must have a value').notEmpty(),
    check('content', 'Content must have a value').notEmpty()
],
    function (req, res) {
        var title = req.body.title
        var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase()
        if (slug == "") slug = title.replace(/\s+/g, '-').toLowerCase()
        var content = req.body.content

        var result = validationResult(req)
        if (result.errors.length > 0) {
            res.render('admin/add_page', {
                errors: result.errors,
                title: title,
                slug: slug,
                content: content
            })
        } else {
            Page.findOne({ slug: slug }, function (err, page) {
                if (page) {
                    req.flash('danger', 'Page slug exists. choose another')
                    res.render('admin/add_page', {
                        title: title,
                        slug: slug,
                        content: content
                    })
                } else {
                    var page = new Page({
                        title: title,
                        slug: slug,
                        content: content,
                        sorting: 100
                    })

                    page.save(function (err) {
                        if (err) return console.log(err)
                        req.flash('success', 'Page added')
                        res.redirect('/admin/pages')
                    })

                }
            })
        }

    }
)

/*
 * Post reorder pages
 */
router.post('/reorder-pages', function (req, res) {
    var ids = req.body['id[]']
    var count = 0
    for (var i = 0; i < ids.length; i++) {
        var id = ids[i]
        count++

        (function (count) {
            Page.findById(id, function (err, page) {
                page.sorting = count
                page.save()
            })
        })(count)
    }
})

module.exports = router
