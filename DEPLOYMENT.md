# Panduan Deployment ke Vercel

## 🚀 Persiapan Repository GitHub

Repository telah terhubung dengan:
```
https://github.com/barmuch/pahambareng.git
```

### Langkah-langkah Push ke GitHub:

1. **Tambahkan semua file**:
   ```bash
   git add .
   ```

2. **Commit perubahan**:
   ```bash
   git commit -m "Initial commit: Setup project paham-bareng"
   ```

3. **Push ke GitHub**:
   ```bash
   git branch -M main
   git push -u origin main
   ```

## 📦 Deployment ke Vercel

### Opsi 1: Deploy via Vercel Dashboard (Recommended)

1. **Login ke Vercel**:
   - Kunjungi [vercel.com](https://vercel.com)
   - Login dengan akun GitHub Anda

2. **Import Project**:
   - Klik "Add New" → "Project"
   - Import repository: `barmuch/pahambareng`
   - Vercel akan otomatis mendeteksi Next.js

3. **Configure Environment Variables**:
   Tambahkan environment variables berikut di Vercel Dashboard:
   
   | Variable | Value | Required |
   |----------|-------|----------|
   | `MONGODB_URI` | MongoDB connection string | ✅ Yes |
   | `JWT_SECRET` | Secret key (min 32 chars) | ✅ Yes |
   | `OPENAI_API_KEY` | OpenAI API key | ⚠️ Optional* |
   | `NEXT_PUBLIC_API_URL` | `/api` | ⚠️ Optional |

   *Note: OPENAI_API_KEY diperlukan jika menggunakan fitur AI chat

4. **Deploy**:
   - Klik "Deploy"
   - Vercel akan otomatis build dan deploy aplikasi

### Opsi 2: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Set Environment Variables**:
   ```bash
   vercel env add MONGODB_URI
   vercel env add JWT_SECRET
   vercel env add OPENAI_API_KEY
   ```

5. **Deploy ke Production**:
   ```bash
   vercel --prod
   ```

## 🔧 Environment Variables Details

### MONGODB_URI
MongoDB connection string. Bisa menggunakan:
- MongoDB Atlas (Recommended untuk production)
- MongoDB Cloud lainnya

Format:
```
mongodb+srv://username:password@cluster.xxxxx.mongodb.net/pahambareng?retryWrites=true&w=majority
```

### JWT_SECRET
Secret key untuk JWT token authentication. Generate dengan:
```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# PowerShell
-join ((48..57) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

### OPENAI_API_KEY (Optional)
API key dari OpenAI untuk fitur AI chat. Dapatkan dari:
- [platform.openai.com](https://platform.openai.com/api-keys)

### NEXT_PUBLIC_API_URL (Optional)
Base URL untuk API routes. Default: `/api`

## ✅ Post-Deployment

### 1. Seed Database (First Time)
Setelah deploy, jalankan seed script untuk membuat admin user:

```bash
# Local
npm run seed:reset

# Atau via API endpoint (jika tersedia)
curl -X POST https://your-app.vercel.app/api/seed
```

### 2. Verifikasi Deployment
- ✅ Website dapat diakses
- ✅ Login dengan akun admin
- ✅ Check MongoDB connection
- ✅ Test fitur-fitur utama

### 3. Custom Domain (Optional)
Di Vercel Dashboard:
1. Go to Project Settings → Domains
2. Tambahkan custom domain Anda
3. Update DNS records sesuai instruksi Vercel

## 🔄 Continuous Deployment

Setiap push ke branch `main` akan otomatis trigger deployment baru di Vercel.

Preview deployments akan dibuat untuk:
- Pull requests
- Pushes ke branch lain

## 📝 Checklist Deployment

- [x] Git repository initialized
- [x] Remote GitHub connected
- [x] Vercel.json configured
- [x] .gitignore setup
- [x] Environment variables documented
- [ ] Files committed to Git
- [ ] Pushed to GitHub
- [ ] MongoDB database setup
- [ ] Vercel project created
- [ ] Environment variables added to Vercel
- [ ] Initial deployment successful
- [ ] Database seeded with admin user
- [ ] Production testing completed

## 🆘 Troubleshooting

### Build Errors
- Check environment variables are set correctly
- Verify MongoDB URI is accessible from Vercel
- Check build logs di Vercel dashboard

### Runtime Errors
- Check function logs di Vercel dashboard
- Verify all environment variables are set
- Check MongoDB connection string

### Database Issues
- Whitelist Vercel IP addresses di MongoDB Atlas (atau gunakan 0.0.0.0/0)
- Verify database name dan credentials

## 📚 Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
