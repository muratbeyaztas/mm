
var express = require('express');

var router = express.Router();



router.get('/',function(req,res){

	res.render('./boat/index', { title: 'Murat, World!' } );	
});


router.post('/sil/:bootId',function(req,res){

});

router.post('/ekle',function(req,res){

});


module.exports = router;