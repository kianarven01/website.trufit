# Deployment Checklist - TruFit Auto Center

## Pre-Deployment

### Environment Setup
- [ ] Server provisioned (minimum: 2 vCPU, 4GB RAM, 40GB SSD)
- [ ] Docker and Docker Compose installed
- [ ] Domain name configured and DNS pointed to server
- [ ] SSL certificates obtained (Let's Encrypt or commercial)
- [ ] Firewall configured (ports 80, 443, 22 only)

### Environment Variables
- [ ] `.env` file created from `.env.example`
- [ ] `APP_KEY` generated (`php artisan key:generate`)
- [ ] `APP_URL` set to production domain
- [ ] Database credentials set (strong passwords)
- [ ] Redis password set
- [ ] Mail credentials configured
- [ ] `SANCTUM_STATEFUL_DOMAINS` set to production domain

### Database
- [ ] PostgreSQL database created
- [ ] Database user created with proper permissions
- [ ] Migrations run (`php artisan migrate --force`)
- [ ] Roles seeded (`php artisan db:seed --class=RoleSeeder`)
- [ ] Initial admin user created

### Security
- [ ] `APP_DEBUG=false` in production
- [ ] `APP_ENV=production` in production
- [ ] HTTPS enforced (redirect HTTP to HTTPS)
- [ ] Security headers configured (CSP, X-Frame-Options, etc.)
- [ ] Rate limiting enabled on auth routes
- [ ] CORS configured for production domain only
- [ ] Database backups scheduled (daily)
- [ ] Log rotation configured

## Deployment Steps

### 1. Pull Latest Code
```bash
cd /var/www/trufit
git pull origin main
```

### 2. Build and Start Containers
```bash
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

### 3. Run Migrations
```bash
docker compose -f docker-compose.prod.yml exec app php artisan migrate --force
```

### 4. Seed Roles
```bash
docker compose -f docker-compose.prod.yml exec app php artisan db:seed --class=RoleSeeder
```

### 5. Cache Configuration
```bash
docker compose -f docker-compose.prod.yml exec app php artisan config:cache
docker compose -f docker-compose.prod.yml exec app php artisan route:cache
docker compose -f docker-compose.prod.yml exec app php artisan view:cache
```

### 6. Set Permissions
```bash
docker compose -f docker-compose.prod.yml exec app chown -R www-data:www-data storage
docker compose -f docker-compose.prod.yml exec app chmod -R 775 storage
```

### 7. Verify Deployment
- [ ] Frontend loads at domain
- [ ] Login works with admin credentials
- [ ] API responds at `/api/auth/verify`
- [ ] Roles and permissions page accessible
- [ ] All modules functional

## Post-Deployment

### Monitoring
- [ ] Application logs checked (`docker compose logs app`)
- [ ] Error tracking configured (Sentry or similar)
- [ ] Uptime monitoring enabled
- [ ] Database performance monitored

### Backups
- [ ] Automated database backups running
- [ ] Storage backups configured
- [ ] Backup restoration tested

### Performance
- [ ] CDN configured for static assets
- [ ] Gzip compression enabled
- [ ] Browser caching headers set
- [ ] Database indexes optimized

## Rollback Plan

If issues occur after deployment:

1. **Quick Rollback**:
   ```bash
   git checkout HEAD~1
   docker compose -f docker-compose.prod.yml build
   docker compose -f docker-compose.prod.yml up -d
   ```

2. **Database Rollback**:
   ```bash
   php artisan migrate:rollback
   ```

3. **Full Restore**:
   - Restore database from backup
   - Deploy previous code version
   - Clear all caches

## Emergency Contacts

- **Developer**: [Name] - [Phone]
- **DevOps**: [Name] - [Phone]
- **Database Admin**: [Name] - [Phone]
