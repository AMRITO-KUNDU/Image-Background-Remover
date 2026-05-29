# BG Remover — AI Image Background Remover

Remove image backgrounds instantly using state-of-the-art AI models.

## Features

- **3 AI Models**: U2-Net (fast), ISNet (balanced), BiRefNet (best accuracy)
- **Alpha Matting**: Optional mode for finer hair/fur edge detail
- **Side-by-side preview**: Compare original vs result instantly
- **Download PNG**: Transparent PNG with one click

## Models

| Model | Speed | Accuracy | Best For |
|-------|-------|----------|----------|
| U2-Net | Fast | Good | Quick results, general use |
| ISNet | Medium | High | Balanced quality |
| BiRefNet | Slower | Best | Hair, fur, fine details |

## Project Structure

```
├── frontend/     # React + Vite (port 5000)
├── backend/      # Python FastAPI (port 8000)
├── README.md
└── .replit
```

## Development

**Backend:**
```bash
cd backend
uvicorn main:app --reload --host localhost --port 8000
```

**Frontend:**
```bash
cd frontend
npm run dev
```

## Tech Stack

- **Frontend**: React, Vite
- **Backend**: Python, FastAPI, rembg
- **Models**: U2-Net, ISNet-general-use, BiRefNet-general
