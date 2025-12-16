// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.adminId) {
    return next();
  }
  
  // For API requests, return JSON
  if (req.path.startsWith('/admin/api')) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized. Please login.',
    });
  }
  
  // For page requests, redirect to login
  res.redirect('/admin/login');
};

module.exports = { isAuthenticated };
