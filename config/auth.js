module.exports = {
    ensureAuthenticated : function(req,res,next) {
        if(req.isAuthenticated()){
            return next();
        }
        req.flash('error_msg', 'You need to log in first');
        res.redirect('users/login');
    },

    ensureAuthenticatedInUsers : function(req,res,next) {
        if(req.isAuthenticated()){
            return next();
        }
        req.flash('error_msg', 'You need to log in first');
        res.redirect('login');
    }
}