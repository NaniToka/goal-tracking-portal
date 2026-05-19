# Deployment Guide

This guide covers deploying the Goal Tracking Portal to production using Vercel (frontend) and Render (backend).

## Prerequisites

- MongoDB Atlas account
- Vercel account
- Render account
- GitHub repository with the code

## Environment Variables

### Backend (Render)
Set these environment variables in Render:

```
NODE_ENV=production
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secure_random_secret
CLIENT_URL=your_vercel_frontend_url
PORT=5000
```

### Frontend (Vercel)
Set this environment variable in Vercel:

```
VITE_API_URL=your_render_backend_url
```

## Backend Deployment (Render)

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Create new Web Service on Render**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `server` directory as root directory
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Add environment variables listed above
   - Click "Deploy Web Service"

3. **Verify Deployment**
   - Wait for the build to complete
   - Test the health endpoint: `https://your-app.onrender.com/api/health`

## Frontend Deployment (Vercel)

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import Project on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Select the `client` directory as root directory
   - Framework Preset: Vite
   - Add environment variable: `VITE_API_URL=your_render_backend_url`
   - Click "Deploy"

3. **Configure CORS**
   - Update the backend `CLIENT_URL` environment variable to match your Vercel URL
   - Redeploy the backend if needed

## MongoDB Atlas Setup

1. **Create Cluster**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster (M0)
   - Wait for cluster to be created

2. **Configure Network Access**
   - Go to Network Access → IP Whitelist
   - Add IP: `0.0.0.0/0` (allows all IPs for Render)

3. **Get Connection String**
   - Go to Database → Connect
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password

4. **Set Environment Variable**
   - Add the connection string to Render as `MONGODB_URI`

## Post-Deployment Steps

1. **Seed Database**
   ```bash
   cd server
   node seed/seed.js
   ```

2. **Test Authentication**
   - Login with demo credentials
   - Verify JWT tokens work
   - Test protected routes

3. **Test Goal Management**
   - Create a goal sheet
   - Submit for approval
   - Test manager approval workflow

4. **Monitor Logs**
   - Check Render logs for errors
   - Check Vercel logs for frontend issues

## Troubleshooting

### CORS Errors
- Ensure `CLIENT_URL` on backend matches your Vercel URL
- Check that credentials are enabled in CORS config

### Database Connection Issues
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Check that connection string is correct
- Ensure database user has proper permissions

### Build Failures
- Check that all dependencies are in package.json
- Verify Node.js version compatibility
- Review build logs for specific errors

## Scaling Considerations

- **Frontend**: Vercel automatically scales with traffic
- **Backend**: Render scales based on instance type
- **Database**: MongoDB Atlas scales based on cluster tier
- Consider upgrading to paid tiers for production workloads

## Security Best Practices

1. Use strong, random `JWT_SECRET`
2. Enable HTTPS (automatic on Vercel and Render)
3. Rotate secrets periodically
4. Use environment variables for all sensitive data
5. Enable MongoDB Atlas security features
6. Monitor logs for suspicious activity
7. Keep dependencies updated

## Backup Strategy

- MongoDB Atlas provides automated backups
- Consider nightly backups for critical data
- Test restore process regularly
